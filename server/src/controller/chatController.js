import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import Notification from "../models/notification.js";
import User from "../models/user.js";
import Company from "../models/company.js";

// ✅ Get all conversations for current user/company
export const getConversations = async (req, res) => {
  try {
    const id = req.userId;
    const role = req.userRole;

    let filter;
    if (role === "company") {
      filter = { companyId: id };
    } else {
      filter = { userId: id };
    }

    const conversations = await Conversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .populate({
        path: "userId",
        select: "name profilePhoto",
      })
      .populate({
        path: "companyId",
        select: "companyName logo",
      });

    res.status(200).json({
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify the user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const id = req.userId;
    const role = req.userRole;

    if (
      (role === "company" && String(conversation.companyId) !== String(id)) ||
      (role !== "company" && String(conversation.userId) !== String(id))
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this conversation" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark unread messages from the other party as read
    const otherRole = role === "company" ? "user" : "company";
    await Message.updateMany(
      {
        conversationId,
        senderRole: otherRole,
        readAt: null,
      },
      { readAt: new Date() }
    );

    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      messages: messages.reverse(), // chronological order
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.userId;
    const senderRole = req.userRole || "user";

    if (!conversationId || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "conversationId and content are required" });
    }

    // Verify the sender is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (
      (senderRole === "company" &&
        String(conversation.companyId) !== String(senderId)) ||
      (senderRole !== "company" &&
        String(conversation.userId) !== String(senderId))
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized in this conversation" });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      senderId,
      senderRole,
      content: content.trim(),
    });

    // Update conversation's last message
    conversation.lastMessage = content.trim().slice(0, 100);
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Create notification for the recipient
    let recipientId, recipientModel, senderName;
    if (senderRole === "company") {
      recipientId = conversation.userId;
      recipientModel = "User";
      const company = await Company.findById(senderId);
      senderName = company?.companyName || "A company";
    } else {
      recipientId = conversation.companyId;
      recipientModel = "Company";
      const user = await User.findById(senderId);
      senderName = user?.name || "A developer";
    }

    await Notification.create({
      recipientId,
      recipientModel,
      senderId,
      senderModel: senderRole === "company" ? "Company" : "User",
      type: "message",
      title: `New message from ${senderName}`,
      body: content.trim().slice(0, 100),
      relatedId: conversationId,
    });

    res.status(201).json({
      message: "Message sent",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
