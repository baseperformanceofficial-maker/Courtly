// models/DeletedUser.js
import mongoose from "mongoose";

const DeletedUserSchema = new mongoose.Schema({
  user: {
    type: Object, // Store whole user object
    required: true,
  },
  billings: [
    {
      type: Object, // Store each billing/payment entry
      required: true,
    },
  ],
  deletedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("DeletedUser", DeletedUserSchema);
