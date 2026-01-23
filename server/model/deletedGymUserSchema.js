import mongoose, { Schema } from "mongoose";

const deletedGymUserSchema = new Schema(
  {
    user: {
      name: String,
      address: String,
      phoneNumber: String,
      whatsAppNumber: String,
      notes: String,
      trainer: { type: Schema.Types.ObjectId, ref: "Trainer" },
      userType: { type: String, enum: ["athlete", "non-athlete", "personal-trainer"] },
      subscription: {
        startDate: Date,
        endDate: Date,
        months: Number,
        status: { type: String, enum: ["active", "expired"] },
      },
    },
    billings: [
      {
        amount: Number,
        modeOfPayment: { type: String, enum: ["card", "upi", "cash"] },
        isGst: Boolean,
        gst: Number,
        gstNumber: String,
        subscriptionMonths: Number,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const DeletedGymUser = mongoose.model("DeletedGymUser", deletedGymUserSchema);
export default DeletedGymUser;
