import Court from "../model/courtSchema.js";
import Billing from "../model/billingSchema.js";
import Booking from "../model/bookingSchema.js";
import DeletedUser from "../model/deletedUserSchema.js";

const createCourt = async (req, res) => {
    const { courtName, surface } = req.body;
    try {
        const response = await Court.create({
            courtName, surface
        })
        res.status(200).json({ message: `Court Created Successfully`, data: response })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error due to', error: error.message })
    }
}

const getCourt = async (req, res) => {
    try {
        const response = await Court.find();
        res.status(200).json({ message: "Court Fetched Successfully", data: response })
    } catch (error) {
        res.status(500).json({ message: 'Internal error due to', error: error.message })
    }
}

const editCourt = async (req, res) => {
    const { id } = req.params;
    const { courtName, surface } = req.body;
    try {
        const response = await Court.findByIdAndUpdate(id, {
            courtName, surface
        }, { new: true })
        res.status(200).json({ message: `Court Edited Successfully`, data: response })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error due to', error: error.message })
    }
}

const deleteCourt = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await Court.findByIdAndDelete(id);
        res.status(200).json({ message: "Court Deleted Successfully", data: response })
    } catch (error) {
        res.status(500).json({ message: "Internal error due to", error: error.message })
    }
}
const getCourtStatistics = async (req, res) => {
  try {
    const now = new Date();
    const lastYear = new Date(now);
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    // --- Overview ---
    const totalBookingsPromise = Booking.countDocuments({});
    const cancelledBookingsPromise = Booking.countDocuments({ status: "cancelled" });
    const totalRevenuePromise = Billing.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const deletedUsersPromise = DeletedUser.countDocuments({});
    const deletedBookingsPromise = DeletedUser.aggregate([
      { $unwind: "$billings" },       // Each billing represents a booking
      { $count: "deletedBookings" }
    ]);

    const [totalBookings, cancelledBookings, totalRevenueAgg, deletedUsers, deletedBookingsAgg] =
      await Promise.all([
        totalBookingsPromise,
        cancelledBookingsPromise,
        totalRevenuePromise,
        deletedUsersPromise,
        deletedBookingsPromise
      ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const deletedBookings = deletedBookingsAgg[0]?.deletedBookings || 0;

    // --- Monthly bookings for last 12 months ---
    const monthlyBookingsAgg = await Booking.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          bookings: { $count: {} },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // --- Monthly revenue from Billing ---
    const monthlyRevenueAgg = await Billing.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthlyBookings = monthlyBookingsAgg.map(m => ({
      month: monthNames[m._id.month - 1],
      bookings: m.bookings,
    }));

    const monthlyRevenue = monthlyRevenueAgg.map(r => ({
      month: monthNames[r._id.month - 1],
      revenue: r.revenue,
    }));

    res.json({
      totalBookings,
      cancelledBookings,
      totalRevenue,
      deletedUsers,
      deletedBookings,
      monthlyBookings,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching court statistics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export {
    createCourt, getCourt, editCourt, deleteCourt,getCourtStatistics
}