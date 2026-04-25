import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Bell, Check, Loader2 } from "lucide-react";

interface Notification {
    _id: string;
    type: string;
    title: string;
    body: string;
    read: boolean;
    relatedId?: string;
    createdAt: string;
}

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get("/notifications/unread-count");
            setUnreadCount(res.data.unreadCount || 0);
        } catch { /* ignore */ }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get("/notifications?limit=10");
            setNotifications(res.data.notifications || []);
        } catch { /* ignore */ }
        setLoading(false);
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) fetchNotifications();
    };

    const markAsRead = async (id: string | "all") => {
        try {
            await api.post("/notifications/mark-read", { notificationIds: id === "all" ? "all" : [id] });
            if (id === "all") {
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            } else {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch { /* ignore */ }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) await markAsRead(notification._id);
        setIsOpen(false);

        if (notification.type === "message" && notification.relatedId) {
            navigate(`/chat/${notification.relatedId}`);
        } else if (notification.type.startsWith("connection")) {
            navigate("/profile"); // or connections page if we had one
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-full hover:bg-gray-800">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#111]">
                        <h3 className="font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={() => markAsRead("all")} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 text-gray-500 animate-spin" /></div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No notifications yet.</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n._id} onClick={() => handleNotificationClick(n)}
                                    className={`p-4 border-b border-gray-800/50 cursor-pointer transition-colors hover:bg-gray-800 ${n.read ? "opacity-70" : "bg-blue-500/5"}`}>
                                    <div className="flex gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            <div className={`w-2 h-2 rounded-full ${n.read ? "bg-transparent" : "bg-blue-500"}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm ${n.read ? "text-gray-300" : "text-white font-medium"}`}>{n.title}</p>
                                            {n.body && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.body}</p>}
                                            <p className="text-[10px] text-gray-600 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
