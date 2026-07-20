const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    phone_number: { type: String, required: true, unique: true, trim: true },
    name: { type: String, default: "New User" },
    university: { type: String },
    city: { type: String },
    partner: { type: String, enum: ["yes", "no"], default: "no" },
    full_name: { type: String },
    gender: { type: String },
    employment_status: { type: String },
    ipk: { type: String },
    handlingMode: {
      type: String,
      enum: ["bot", "manual"],
      default: "bot",
    },
    leadType: {
      type: String,
      enum: ["general", "hot"],
      default: "general",
    },
    isLeadActive: {
      type: Boolean,
      default: true,
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    handlingHistory: [
      {
        handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
        leadType: { type: String },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    lastInteractionAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
