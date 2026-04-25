import Notification from "../models/notification.js";

// ✅ Get notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const recipientId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ recipientId });

    res.status(200).json({
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const recipientId = req.userId;
    const count = await Notification.countDocuments({
      recipientId,
      read: false,
    });
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Mark notification(s) as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body; // array of IDs, or "all"

    if (notificationIds === "all") {
      await Notification.updateMany(
        { recipientId: req.userId, read: false },
        { read: true }
      );
    } else if (Array.isArray(notificationIds)) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, recipientId: req.userId },
        { read: true }
      );
    } else {
      return res.status(400).json({ message: "Invalid notificationIds" });
    }

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
