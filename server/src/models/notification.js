import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "recipientModel",
  },
  recipientModel: {
    type: String,
    enum: ["User", "Company"],
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "senderModel",
  },
  senderModel: {
    type: String,
    enum: ["User", "Company"],
    required: true,
  },
  type: {
    type: String,
    enum: ["connection_request", "connection_accepted", "connection_rejected", "message", "general"],
    required: true,
  },
  title: { type: String, required: true },
  body: { type: String, default: "" },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // e.g. connectionId or conversationId
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
