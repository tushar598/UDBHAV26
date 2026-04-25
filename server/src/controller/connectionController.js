import Connection from "../models/connection.js";
import Notification from "../models/notification.js";
import Company from "../models/company.js";
import User from "../models/user.js";
import Conversation from "../models/conversation.js";

// ✅ Send connection request (Company → User)
export const sendConnectionRequest = async (req, res) => {
  try {
    const companyId = req.userId;
    const { userId, message } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if connection already exists
    const existing = await Connection.findOne({ companyId, userId });
    if (existing) {
      return res.status(400).json({
        message: `Connection already exists with status: ${existing.status}`,
      });
    }

    // Get company details for notification
    const company = await Company.findById(companyId);

    // Create connection
    const connection = await Connection.create({
      companyId,
      userId,
      message: message || "",
      status: "pending",
    });

    // Create notification for the user
    await Notification.create({
      recipientId: userId,
      recipientModel: "User",
      senderId: companyId,
      senderModel: "Company",
      type: "connection_request",
      title: `${company?.companyName || "A company"} wants to connect with you`,
      body: message || "You have a new connection request from a company.",
      relatedId: connection._id,
    });

    res.status(201).json({
      message: "Connection request sent",
      connection,
    });
  } catch (error) {
    console.error("Error sending connection request:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Respond to connection request (User accepts/rejects)
export const respondToConnection = async (req, res) => {
  try {
    const userId = req.userId;
    const { connectionId, action } = req.body; // action: "accept" | "reject"

    if (!connectionId || !["accept", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ message: "connectionId and action (accept/reject) required" });
    }

    const connection = await Connection.findOne({
      _id: connectionId,
      userId,
      status: "pending",
    });

    if (!connection) {
      return res
        .status(404)
        .json({ message: "Connection request not found or already processed" });
    }

    connection.status = action === "accept" ? "accepted" : "rejected";
    connection.updatedAt = new Date();
    await connection.save();

    // Get user details for notification
    const user = await User.findById(userId);

    // Notify the company
    await Notification.create({
      recipientId: connection.companyId,
      recipientModel: "Company",
      senderId: userId,
      senderModel: "User",
      type:
        action === "accept" ? "connection_accepted" : "connection_rejected",
      title: `${user?.name || "A developer"} ${action}ed your connection request`,
      body:
        action === "accept"
          ? "You can now chat with this developer."
          : "The developer declined your connection request.",
      relatedId: connection._id,
    });

    // If accepted, create a conversation for chat
    if (action === "accept") {
      const existingConvo = await Conversation.findOne({
        companyId: connection.companyId,
        userId,
      });
      if (!existingConvo) {
        await Conversation.create({
          companyId: connection.companyId,
          userId,
        });
      }
    }

    res.status(200).json({
      message: `Connection ${action}ed`,
      connection,
    });
  } catch (error) {
    console.error("Error responding to connection:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get connections for company or user
export const getConnections = async (req, res) => {
  try {
    const id = req.userId;
    const role = req.userRole;
    const status = req.query.status; // optional filter

    let filter;
    if (role === "company") {
      filter = { companyId: id };
    } else {
      filter = { userId: id };
    }

    if (status) {
      filter.status = status;
    }

    const connections = await Connection.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "name profilePhoto skills skillLevel location",
      })
      .populate({
        path: "companyId",
        select: "companyName logo industry location",
      });

    res.status(200).json({
      message: "Connections fetched",
      total: connections.length,
      connections,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
