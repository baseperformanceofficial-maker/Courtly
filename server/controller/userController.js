import { User } from "../model/userSchema.js";
import mongoose from "mongoose";
import Booking from "../model/bookingSchema.js";
import Slot from "../model/slotSchema.js";
import Billing from "../model/billingSchema.js";
import DeletedUser from "../model/deletedUserSchema.js";
const getAllUsers = async (req, res) => {
  try {
    const { phoneNumber, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let query = {};

    if (phoneNumber) {
      query.phoneNumber = { $regex: phoneNumber, $options: "i" };
    }

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(query),
    ]);

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      totalUsers: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phoneNumber, whatsAppNumber, address } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (phoneNumber && !/^[0-9]{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }
    if (whatsAppNumber && !/^[0-9]{10}$/.test(whatsAppNumber)) {
      return res.status(400).json({ message: "Invalid WhatsApp number format" });
    }
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const phoneExists = await User.findOne({ phoneNumber });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number already exists" });
      }
    }
    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.whatsAppNumber = whatsAppNumber ?? user.whatsAppNumber;
    user.address = address ?? user.address;

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Find the user
    const user = await User.findById(id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // Find all billings of this user
    const billings = await Billing.find({ userId: id }).session(session);

    // Find all bookings of this user
    const bookings = await Booking.find({ userId: id }).session(session);
    const bookingIds = bookings.map(b => b._id);
    const slotIds = bookings.flatMap(b => b.slotIds);

    // Check for active bookings
    const activeBookings = bookings.filter(b => b.status === "active");

    // Archive user + billing into DeletedUser collection
    await DeletedUser.create(
      [
        {
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            // include other relevant user fields
          },
          billings: billings.map(b => ({
            amount: b.amount,
            paymentDate: b.createdAt,
            modeOfPayment: b.modeOfPayment,
            bookingId: b.bookingId,
            courtId: b.courtId,
            // include any other relevant billing fields
          })),
        },
      ],
      { session }
    );

    // Delete user + bookings/slots but NOT billing
    await Promise.all([
      User.deleteOne({ _id: id }).session(session),
      Booking.deleteMany({ userId: id }).session(session),
      Slot.deleteMany({ $or: [{ userId: id }, { _id: { $in: slotIds } }] }).session(session),
    ]);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "User soft deleted successfully (archived user + billing, deleted bookings/slots)",
      deleted: {
        bookings: bookingIds.length,
        slots: slotIds.length,
        billings: billings.length,
      },
      notification: activeBookings.length > 0
        ? `⚠️ User had ${activeBookings.length} active booking(s) which were cancelled and deleted.`
        : "No active bookings at the time of deletion.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error soft deleting user:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getDeletedUsers = async (req, res) => {
  try {
    // Fetch all deleted users with their billings
    const deletedUsersData = await DeletedUser.find().sort({ deletedAt: -1 }); // latest first

    // Count totals
    const deletedUsersCount = deletedUsersData.length;
    const deletedBookingsCount = deletedUsersData.reduce(
      (acc, user) => acc + (user.billings?.length || 0),
      0
    );

    res.status(200).json({
      deletedUsersCount,
      deletedBookingsCount,
      deletedUsers: deletedUsersData, // full data with user info and billings
    });
  } catch (error) {
    console.error("Error fetching deleted users:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export{getAllUsers,updateUser,deleteUser,getUserById,getDeletedUsers}