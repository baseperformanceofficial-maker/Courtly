import mongoose, { Schema } from "mongoose";

const gymBillingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "GymUsers", required: true },
     userInfo: {
      name: { type: String, required: true },
      address: { type: String },
      phoneNumber: { type: String },
      whatsAppNumber: { type: String },
      notes: { type: String },
      trainer: { type: Schema.Types.ObjectId, ref: "Trainer" },
      userType: { type: String, enum: ["athlete", "non-athlete", "personal-trainer"] },
      subscription: {
        startDate: { type: Date },
        endDate: { type: Date },
        months: { type: Number },
        status: { type: String, enum: ["active", "expired"] },
      },
    },

    amount: { type: Number, required: true },
    isGst: { type: Boolean, default: false },
    gst: { type: Number, default: 0 },
    gstNumber: { type: String },

    subscriptionMonths: { type: Number, required: true, min: 1, max: 12 },


    modeOfPayment: {
      type: String,
      enum: ["card", "upi", "cash"],
      required: true,
    },

    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for faster queries
gymBillingSchema.index({ userId: 1, createdAt: -1 });
gymBillingSchema.index({ subscriptionMonths: 1, createdAt: -1 });

const GymBilling = mongoose.model("GymBilling", gymBillingSchema);
export default GymBilling;
