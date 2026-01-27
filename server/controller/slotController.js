import Slot from "../model/slotSchema.js";
import Court from "../model/courtSchema.js";
import { User } from "../model/userSchema.js";
import Booking from "../model/bookingSchema.js"
import mongoose from "mongoose";
import Billing from "../model/billingSchema.js";
const formatTime = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString().substring(11, 16);
};
const bookSlot = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      courtId,
      startDate,
      endDate,
      startTime,
      endTime,
      phoneNumber,
      firstName,
      lastName,
      whatsAppNumber,
      address,
      notes,
      amount,
      isGst,
      gst,
      gstNumber,
      modeOfPayment,
    } = req.body;

    // --- Validations ---
    if (!courtId) return res.status(400).json({ message: "Court ID is required" });

    // --- Date Validations ---
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start) || isNaN(end)) return res.status(400).json({ message: "Invalid start or end date" });
    if (start > end) return res.status(400).json({ message: "Start date must be before end date" });
    if (start < today) return res.status(400).json({ message: "Start date cannot be in the past" });

    const maxRangeDays = 365;
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > maxRangeDays) return res.status(400).json({ message: `Booking cannot exceed ${maxRangeDays} days` });

    // --- Time Validations ---
// --- Time Validations ---
if (!startTime || !endTime) return res.status(400).json({ message: "Start and end time are required" });

const [startH, startM = 0] = startTime.split(":").map(Number);
const [endH, endM = 0] = endTime.split(":").map(Number);

if (isNaN(startH) || isNaN(endH)) return res.status(400).json({ message: "Invalid time format, expected HH:mm" });

// --- Combine date and time for start and end ---
const startDateTime = new Date(start);
startDateTime.setHours(startH, startM, 0, 0);

const endDateTime = new Date(end);
endDateTime.setHours(endH, endM, 0, 0);

// --- Check if start time is in the past ---
const now = new Date();
now.setSeconds(0, 0);
if (startDateTime < now) {
  return res.status(400).json({ message: "Start time cannot be in the past" });
}

// --- Check if end time is after start time ---
if (endDateTime <= startDateTime) {
  return res.status(400).json({ message: "End time must be after start time" });
}


    // --- Phone Validation (India) ---
    if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number. Must be 10 digits and start with 6, 7, 8, or 9" });
    }

    if (notes && notes.length > 300) return res.status(400).json({ message: "Notes too long (max 300 chars)" });

    if (amount == null) return res.status(400).json({ message: "Amount is required" });
    if (isNaN(amount) || amount < 0) return res.status(400).json({ message: "Amount must be a positive number" });

    if (isGst) {
      if (gst == null || isNaN(gst) || gst < 0) return res.status(400).json({ message: "GST must be a valid non-negative number" });
      if (!gstNumber || gstNumber.length > 20) return res.status(400).json({ message: "GST Number is required and max 20 chars" });
    }

    if (!modeOfPayment) return res.status(400).json({ message: "Payment mode is required" });
    const validPayments = ["card", "upi", "cash"];
    if (!validPayments.includes(modeOfPayment)) {
      return res.status(400).json({ message: "Invalid payment mode, must be card, upi, or cash" });
    }

    // --- Court Exists ---
    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    // --- User Handling ---
    let user = await User.findOne({ phoneNumber }).session(session);

    if (!user) {
      if (!firstName || firstName.length > 50) return res.status(400).json({ message: "First name is required (max 50 chars)" });
      if (!lastName || lastName.length > 50) return res.status(400).json({ message: "Last name is required (max 50 chars)" });
      if (!whatsAppNumber || !/^[6-9]\d{9}$/.test(whatsAppNumber)) {
        return res.status(400).json({ message: "WhatsApp number must be 10 digits and start with 6, 7, 8, or 9" });
      }
      if (!address || address.length > 200) return res.status(400).json({ message: "Address is required (max 200 chars)" });

      user = await User.create([{ firstName, lastName, phoneNumber, whatsAppNumber, address }], { session });
      user = user[0];
    } else {
      if (firstName && firstName.length > 50) return res.status(400).json({ message: "First name too long" });
      if (lastName && lastName.length > 50) return res.status(400).json({ message: "Last name too long" });
      if (whatsAppNumber && !/^[6-9]\d{9}$/.test(whatsAppNumber)) {
        return res.status(400).json({ message: "WhatsApp number must be 10 digits and start with 6, 7, 8, or 9" });
      }
      if (address && address.length > 200) return res.status(400).json({ message: "Address too long" });

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.whatsAppNumber = whatsAppNumber || user.whatsAppNumber;
      user.address = address || user.address;
      await user.save({ session });
    }

    // --- Prepare slots ---
    const slotsToCreate = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
    const slotStart = new Date(Date.UTC(
  currentDate.getUTCFullYear(),
  currentDate.getUTCMonth(),
  currentDate.getUTCDate(),
  startH,
  startM,
  0,
  0
));

const slotEnd = new Date(Date.UTC(
  currentDate.getUTCFullYear(),
  currentDate.getUTCMonth(),
  currentDate.getUTCDate(),
  endH,
  endM,
  0,
  0
));


    if (slotStart >= slotEnd) {
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ 
      message: "Start time must be before end time" 
    });
  }

      // Overlap check
      const overlap = await Slot.findOne({
        courtId,
        isBooked: true,
        $or: [{ startTime: { $lt: slotEnd }, endTime: { $gt: slotStart } }],
      }).session(session).populate("userId");

      if (overlap) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: "Overlap found with existing booking",
          details: {
            date: overlap.startTime.toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            time: `${overlap.startTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} - ${overlap.endTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
            bookedBy: overlap.userId ? `${overlap.userId.firstName || ""} ${overlap.userId.lastName || ""}`.trim() : "Unknown",
          },
        });
      }

      slotsToCreate.push({
        courtId,
        startDate: new Date(currentDate),
        endDate: new Date(currentDate),
        startTime: slotStart,
        endTime: slotEnd,
        isBooked: true,
        isMultiDay: start.getTime() !== end.getTime(),
        userId: user._id,
        notes,
        amount,
        isGst,
        gst,
        gstNumber,
        modeOfPayment,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const createdSlots = await Slot.insertMany(slotsToCreate, { session });

    // Booking
   const bookingStartTime = new Date(Date.UTC(
  start.getUTCFullYear(),
  start.getUTCMonth(),
  start.getUTCDate(),
  startH,
  startM,
  0,
  0
));

const bookingEndTime = new Date(Date.UTC(
  end.getUTCFullYear(),
  end.getUTCMonth(),
  end.getUTCDate(),
  endH,
  endM,
  0,
  0
));


    const booking = await Booking.create([{
      courtId,
      userId: user._id,
      slotIds: createdSlots.map((s) => s._id),
      startDate: start,
      endDate: end,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      isMultiDay: start.toDateString() !== end.toDateString(),
      notes,
      amount,
      isGst,
      gst,
      gstNumber,
      modeOfPayment,
    }], { session });

    await Billing.create([{
      bookingId: booking[0]._id,
      userId: user._id,
      courtId,
      amount,
      isGst,
      gst,
      gstNumber,
      modeOfPayment,
      userInfo: {      
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    whatsAppNumber: user.whatsAppNumber,
    email: user.email || null,
    address: user.address || null,
  },
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // --- Format response ---
    const formatTime = (date) =>
      new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });

    const formattedBooking = {
      ...booking[0].toObject(),
      startDate: formatDate(booking[0].startDate),
      endDate: formatDate(booking[0].endDate),
      startTime: formatTime(booking[0].startTime),
      endTime: formatTime(booking[0].endTime),
    };

    return res.status(201).json({
      message: "Slots booked successfully",
      booking: formattedBooking,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in bookSlot:", err);
    return res.status(500).json({ message: "Unexpected error", error: err.message });
  }
};
const bookedSlots = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Court ID is required" });
  }

  try {
    // -------------------------------
    // 1️⃣ Get UTC day range (for query)
    // -------------------------------
    const getUTCDayRange = (inputDate) => {
      const d = inputDate ? new Date(inputDate) : new Date();

      const start = new Date(Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        0, 0, 0, 0
      ));

      const end = new Date(Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        23, 59, 59, 999
      ));

      return { start, end };
    };

    const { start, end } = getUTCDayRange(date);

    // -------------------------------
    // 2️⃣ Fetch booked slots (UTC)
    // -------------------------------
    const slots = await Slot.aggregate([
      {
        $match: {
          courtId: new mongoose.Types.ObjectId(id),
          isBooked: true,
          startDate: { $gte: start, $lte: end },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "courts",
          localField: "courtId",
          foreignField: "_id",
          as: "court",
        },
      },
      { $unwind: { path: "$court", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          slotId: "$_id",
          courtName: "$court.courtName",
          userFirstName: "$user.firstName",
          userLastName: "$user.lastName",
          phoneNumber: "$user.phoneNumber",
          notes: 1,
          startTime: 1,
          endTime: 1,
          startDate: 1,
        },
      },
      { $sort: { startDate: 1, startTime: 1 } },
    ]);

    if (!slots.length) {
      return res.status(200).json({
        message: date
          ? `No bookings found for ${new Date(date).toLocaleDateString("en-IN", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "Asia/Kolkata",
            })}`
          : "No bookings found for today",
        count: 0,
        data: [],
      });
    }

    // -------------------------------
    // 3️⃣ UTC → IST conversion (ONLY HERE)
    // -------------------------------
  const formatTimeIST = (date) => {
  if (!date) return null;
  
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'  // Specify UTC timezone
  });
};

    const formatDateIST = (utcDate) => {
      return new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(utcDate));
    };

    // -------------------------------
    // 4️⃣ Final response formatting
    // -------------------------------
    const formatted = slots.map((slot) => ({
      slotId: slot.slotId,
      court: slot.courtName || "Unknown Court",
      bookedBy: `${slot.userFirstName || ""} ${slot.userLastName || ""}`.trim(),
      phoneNumber: slot.phoneNumber || "",
      date: formatDateIST(slot.startDate),
      time: `${formatTimeIST(slot.startTime)} - ${formatTimeIST(slot.endTime)}`,
      notes: slot.notes || "",
    }));

    return res.status(200).json({
      message: date
        ? `Bookings for ${formatDateIST(date)}`
        : "Today's booked slots",
      count: formatted.length,
      data: formatted,
    });

  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params; // bookingId

    // Find booking with slots
    const booking = await Booking.findById(id).populate("slotIds");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (["cancelled", "expired"].includes(booking.status)) {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    // --- Cancellation cutoff check (e.g. 1 hour before start time) ---
    const cutoffMinutes = 60; // change as needed
    const now = new Date();
    const bookingStart = new Date(booking.startDate + " " + booking.startTime); // adjust if you store times differently

    if (bookingStart - now <= cutoffMinutes * 60 * 1000) {
      return res.status(400).json({
        message: `Cancellations are not allowed within ${cutoffMinutes} minutes of start time`,
      });
    }

    // Mark booking as cancelled
    booking.status = "cancelled";
    await booking.save();

    // Free all slots linked to this booking
    await Slot.updateMany(
      { _id: { $in: booking.slotIds } },
      { $set: { isBooked: false, userId: null, notes: null } }
    );

    res.status(200).json({
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};
const renewSlot = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const {
      courtId,
      startDate,
      endDate,
      startTime,
      endTime,
      amount,
      isGst,
      gst,
      gstNumber,
      modeOfPayment,
      notes,
    } = req.body || {};

    // --- Court Validation ---
    if (!courtId) return res.status(400).json({ message: "Court ID is required" });
    if (!mongoose.isValidObjectId(courtId)) return res.status(400).json({ message: "Invalid Court ID format" });

    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: `Court not found for ID: ${courtId}` });

    // --- Booking Validation ---
    if (!bookingId) return res.status(400).json({ message: "Booking ID is required" });
    if (!mongoose.isValidObjectId(bookingId)) return res.status(400).json({ message: "Invalid Booking ID format" });

    // --- Date Validation ---
    if (!startDate || !endDate) return res.status(400).json({ message: "Start and end date are required" });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start) || isNaN(end)) return res.status(400).json({ message: "Invalid dates" });
    if (start > end) return res.status(400).json({ message: "Start date must be before end date" });
    if (start < today) return res.status(400).json({ message: "Start date cannot be in the past" });

    const maxRangeDays = 365;
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > maxRangeDays) {
      return res.status(400).json({ message: `Booking cannot exceed ${maxRangeDays} days` });
    }

    // --- Time Validation ---
    if (!startTime || !endTime) return res.status(400).json({ message: "Start and end time are required" });

    const [startH, startM = 0] = startTime.split(":").map(Number);
    const [endH, endM = 0] = endTime.split(":").map(Number);

    if (isNaN(startH) || isNaN(endH)) return res.status(400).json({ message: "Invalid time format, expected HH:mm" });

    const startDateTime = new Date(start);
    startDateTime.setHours(startH, startM, 0, 0);

    const endDateTime = new Date(end);
    endDateTime.setHours(endH, endM, 0, 0);

    const now = new Date();
    now.setSeconds(0, 0);

    if (startDateTime < now) {
      return res.status(400).json({ message: "Start time cannot be in the past" });
    }
    if (endDateTime <= startDateTime) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    // --- Amount Validation ---
    if (amount == null || isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    if (isGst) {
      if (gst == null || isNaN(gst) || gst < 0) {
        return res.status(400).json({ message: "GST must be a valid non-negative number" });
      }
      if (!gstNumber || gstNumber.length > 20) {
        return res.status(400).json({ message: "GST Number is required and max 20 chars" });
      }
    }

    const validPayments = ["card", "upi", "cash"];
    if (!modeOfPayment || !validPayments.includes(modeOfPayment)) {
      return res.status(400).json({ message: "Invalid payment mode" });
    }

    // --- Fetch original booking & user ---
    const originalBooking = await Booking.findById(bookingId).populate("userId");
    if (!originalBooking) return res.status(404).json({ message: "Original booking not found" });

    const user = originalBooking.userId;
    const userId = user._id;

    // --- Prepare Slots ---
    const slotsToCreate = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const slotStart = new Date(currentDate);
      slotStart.setHours(startH, startM, 0, 0);

      const slotEnd = new Date(currentDate);
      slotEnd.setHours(endH, endM, 0, 0);

      if (slotStart >= slotEnd) {
        return res.status(400).json({ message: "Start time must be before end time" });
      }

      // Overlap check
      const overlap = await Slot.findOne({
        courtId,
        isBooked: true,
        $or: [{ startTime: { $lt: slotEnd }, endTime: { $gt: slotStart } }],
      });
      if (overlap) {
        return res.status(400).json({
          message: "Overlap found with existing booking",
          date: overlap.startTime.toDateString(),
        });
      }

      slotsToCreate.push({
        courtId,
        startDate: new Date(currentDate),
        endDate: new Date(currentDate),
        startTime: slotStart,
        endTime: slotEnd,
        isBooked: true,
        userId,
        notes,
        amount,
        isGst,
        gst,
        gstNumber,
        modeOfPayment,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // --- Save Slots ---
    const createdSlots = await Slot.insertMany(slotsToCreate);

    // --- Booking ---
    const bookingStartTime = new Date(start);
    bookingStartTime.setHours(startH, startM, 0, 0);

    const bookingEndTime = new Date(end);
    bookingEndTime.setHours(endH, endM, 0, 0);

    const newBooking = await Booking.create({
      courtId,
      userId,
      slotIds: createdSlots.map((s) => s._id),
      startDate: start,
      endDate: end,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      isMultiDay: start.toDateString() !== end.toDateString(),
      notes,
      amount,
      isGst,
      gst,
      gstNumber,
      modeOfPayment,
      isRenewal: true,
      parentBooking: bookingId,
    });

    // --- Billing with user info ---
    await Billing.create({
      bookingId: newBooking._id,
      userId,
      courtId,
      amount,
      isGst,
      gst,
      gstNumber,
      modeOfPayment,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        whatsAppNumber: user.whatsAppNumber,
        email: user.email || null,
        address: user.address || null,
      },
    });

    // --- Response ---
    const formatTime = (date) =>
      new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });

    const formatDate = (date) =>
      new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });

    return res.status(201).json({
      message: "Renewal booking created successfully",
      booking: {
        ...newBooking.toObject(),
        startDate: formatDate(newBooking.startDate),
        endDate: formatDate(newBooking.endDate),
        startTime: formatTime(newBooking.startTime),
        endTime: formatTime(newBooking.endTime),
      },
    });

  } catch (err) {
    console.error("Error in renewSlot:", err);
    return res.status(500).json({ message: "Unexpected error", error: err.message });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { courtId } = req.params;

    const slots = await Slot.find({ courtId, isBooked: false });

    res.status(200).json({
      message: "Available slots fetched successfully",
      data: slots,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching available slots",
      error: error.message,
    });
  }
};

export { bookSlot, cancelBooking, getAvailableSlots, bookedSlots,renewSlot };
