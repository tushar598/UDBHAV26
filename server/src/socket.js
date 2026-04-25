import jwt from "jsonwebtoken";
import Message from "./models/message.js";
import Conversation from "./models/conversation.js";
import Notification from "./models/notification.js";
import User from "./models/user.js";
import Company from "./models/company.js";

let _io = null;

export const getIO = () => {
    if (!_io) throw new Error("Socket.IO not initialized");
    return _io;
};

export const initSocket = (io) => {
    _io = io;

    // ✅ JWT Auth middleware for sockets
    io.use((socket, next) => {
        try {
            // Read token from handshake cookie string
            const cookieHeader = socket.handshake.headers.cookie || "";
            const tokenMatch = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
            const token = tokenMatch ? tokenMatch[1] : null;

            if (!token) return next(new Error("Unauthorized: no token"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role || "user";
            next();
        } catch (err) {
            next(new Error("Unauthorized: invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`[Socket] Connected: ${socket.userId} (${socket.userRole})`);

        // ✅ Join a conversation room
        socket.on("join_conversation", async (conversationId) => {
            try {
                const conv = await Conversation.findById(conversationId);
                if (!conv) return;

                const isAllowed =
                    (socket.userRole === "company" &&
                        String(conv.companyId) === String(socket.userId)) ||
                    (socket.userRole !== "company" &&
                        String(conv.userId) === String(socket.userId));

                if (!isAllowed) return;

                socket.join(conversationId);
                console.log(`[Socket] ${socket.userId} joined room ${conversationId}`);
            } catch (err) {
                console.error("[Socket] join_conversation error:", err.message);
            }
        });

        // ✅ Send a message in real-time
        socket.on("send_message", async ({ conversationId, content }, ack) => {
            try {
                if (!conversationId || !content?.trim()) return;

                const conv = await Conversation.findById(conversationId);
                if (!conv) return;

                const isAllowed =
                    (socket.userRole === "company" &&
                        String(conv.companyId) === String(socket.userId)) ||
                    (socket.userRole !== "company" &&
                        String(conv.userId) === String(socket.userId));

                if (!isAllowed) return;

                // Save message to DB
                const message = await Message.create({
                    conversationId,
                    senderId: socket.userId,
                    senderRole: socket.userRole,
                    content: content.trim(),
                });

                // Update conversation last message
                conv.lastMessage = content.trim().slice(0, 100);
                conv.lastMessageAt = new Date();
                await conv.save();

                // Create notification for recipient
                let recipientId, recipientModel, senderName;
                if (socket.userRole === "company") {
                    recipientId = conv.userId;
                    recipientModel = "User";
                    const company = await Company.findById(socket.userId);
                    senderName = company?.companyName || "A company";
                } else {
                    recipientId = conv.companyId;
                    recipientModel = "Company";
                    const user = await User.findById(socket.userId);
                    senderName = user?.name || "A developer";
                }

                await Notification.create({
                    recipientId,
                    recipientModel,
                    senderId: socket.userId,
                    senderModel: socket.userRole === "company" ? "Company" : "User",
                    type: "message",
                    title: `New message from ${senderName}`,
                    body: content.trim().slice(0, 100),
                    relatedId: conversationId,
                });

                // Broadcast to all in the conversation room
                io.to(conversationId).emit("new_message", message);

                // Acknowledge sender
                if (typeof ack === "function") ack({ success: true, message });
            } catch (err) {
                console.error("[Socket] send_message error:", err.message);
                if (typeof ack === "function") ack({ success: false });
            }
        });

        // ✅ Typing indicators
        socket.on("typing_start", ({ conversationId }) => {
            socket.to(conversationId).emit("typing_start", {
                userId: socket.userId,
                role: socket.userRole,
            });
        });

        socket.on("typing_stop", ({ conversationId }) => {
            socket.to(conversationId).emit("typing_stop", {
                userId: socket.userId,
            });
        });

        // ✅ Mark messages as read
        socket.on("mark_read", async ({ conversationId }) => {
            try {
                const otherRole = socket.userRole === "company" ? "user" : "company";
                await Message.updateMany(
                    { conversationId, senderRole: otherRole, readAt: null },
                    { readAt: new Date() }
                );
                socket.to(conversationId).emit("messages_read", {
                    conversationId,
                    readBy: socket.userId,
                });
            } catch (err) {
                console.error("[Socket] mark_read error:", err.message);
            }
        });

        socket.on("disconnect", () => {
            console.log(`[Socket] Disconnected: ${socket.userId}`);
        });
    });

    console.log("[Socket] Socket.IO initialized");
};
