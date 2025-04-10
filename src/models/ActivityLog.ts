import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  userId: String,
  action: String,
  detail: Object,
  createdAt: { type: Date, default: Date.now }
});

export const ActivityLog = mongoose.model("ActivityLog", logSchema);