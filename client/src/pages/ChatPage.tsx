import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send, Loader2, ArrowLeft, MessageSquare, Search,
    CheckCheck, Check, Wifi, WifiOff, Circle
} from "lucide-react";

interface Message {
    _id: string;
    senderId: string;
    senderRole: string;
    content: string;
    createdAt: string;
    readAt?: string | null;
    conversationId?: string;
}

interface Conversation {
    _id: string;
    companyId: any;
    userId: any;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount?: number;
}

const ChatPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { conversationId } = useParams<{ conversationId?: string }>();
    const { isConnected, joinConversation, sendSocketMessage, emitTypingStart, emitTypingStop, markRead, socket } = useSocket(!!user);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [input, setInput] = useState("");
    const [loadingConv, setLoadingConv] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ─── Fetch conversations ───────────────────────────────────────────────────
    useEffect(() => {
        if (!user) { navigate("/login"); return; }
        const fetchConvs = async () => {
            try {
                const res = await api.get("/chat/conversations");
                setConversations(res.data.conversations || []);
                if (!conversationId && res.data.conversations?.length > 0) {
                    navigate(`/chat/${res.data.conversations[0]._id}`, { replace: true });
                }
            } catch (err) { console.error(err); }
            setLoadingConv(false);
        };
        fetchConvs();
    }, [user]);

    // ─── Load messages + join socket room ─────────────────────────────────────
    useEffect(() => {
        if (!conversationId) { setActiveConv(null); setMessages([]); return; }
        const active = conversations.find(c => c._id === conversationId);
        if (active) setActiveConv(active);

        const fetchMsgs = async () => {
            setLoadingMsgs(true);
            try {
                const res = await api.get(`/chat/messages/${conversationId}`);
                setMessages(res.data.messages || []);
            } catch (err) { console.error(err); }
            setLoadingMsgs(false);
        };
        fetchMsgs();

        // Join the socket room
        if (isConnected) {
            joinConversation(conversationId);
            markRead(conversationId);
        }
    }, [conversationId, conversations, isConnected]);

    // ─── Socket: incoming messages ─────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const onNewMessage = (msg: Message) => {
            setMessages(prev => {
                // Avoid duplicates (in case REST and socket both deliver)
                if (prev.find(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
            // Update conversation's last message
            setConversations(prev =>
                prev.map(c => c._id === msg.conversationId
                    ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt }
                    : c
                ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
            );
            if (msg.senderId !== user?._id) {
                markRead(conversationId!);
            }
        };

        const onTypingStart = () => setTypingUser("typing");
        const onTypingStop = () => setTypingUser(null);
        const onMessagesRead = () => {
            setMessages(prev => prev.map(m =>
                m.senderId === user?._id && !m.readAt
                    ? { ...m, readAt: new Date().toISOString() }
                    : m
            ));
        };

        socket.on("new_message", onNewMessage);
        socket.on("typing_start", onTypingStart);
        socket.on("typing_stop", onTypingStop);
        socket.on("messages_read", onMessagesRead);

        return () => {
            socket.off("new_message", onNewMessage);
            socket.off("typing_start", onTypingStart);
            socket.off("typing_stop", onTypingStop);
            socket.off("messages_read", onMessagesRead);
        };
    }, [socket, conversationId, user]);

    // ─── Auto-scroll ──────────────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUser]);

    // ─── Typing handler ───────────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        if (!conversationId) return;
        emitTypingStart(conversationId);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => emitTypingStop(conversationId!), 1500);
    };

    // ─── Send message ─────────────────────────────────────────────────────────
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !conversationId || sending) return;
        emitTypingStop(conversationId);

        const content = input.trim();
        setInput("");
        setSending(true);

        // Optimistic UI
        const tempMsg: Message = {
            _id: `temp_${Date.now()}`,
            senderId: user!._id,
            senderRole: user!.role || "user",
            content,
            createdAt: new Date().toISOString(),
            readAt: null,
        };
        setMessages(prev => [...prev, tempMsg]);

        // Send via socket (falls back to REST if socket not connected)
        if (isConnected) {
            sendSocketMessage(conversationId, content, ({ success, message }) => {
                if (success && message) {
                    // Replace temp message with real one from server
                    setMessages(prev => prev.map(m => m._id === tempMsg._id ? message : m));
                } else if (!success) {
                    setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
                }
                setSending(false);
            });
        } else {
            // HTTP fallback
            try {
                const res = await api.post("/chat/send", { conversationId, content });
                const realMsg = res.data.data;
                setMessages(prev => prev.map(m => m._id === tempMsg._id ? realMsg : m));
            } catch {
                setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
            } finally {
                setSending(false);
            }
        }
    };

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const getOtherParty = (conv: Conversation) =>
        user?.role === "company" ? conv.userId : conv.companyId;

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return "Today";
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
        return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
    };

    const shouldShowDateSep = (msg: Message, prev: Message | undefined) => {
        if (!prev) return true;
        return new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString();
    };

    const shouldShowTimestamp = (msg: Message, prevMsg: Message | undefined) => {
        if (!prevMsg) return true;
        return new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 300000;
    };

    const filteredConvs = conversations.filter(conv => {
        const other = getOtherParty(conv);
        const name = (other?.name || other?.companyName || "").toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    const initials = (name: string) =>
        (name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    if (!user) return null;

    if (loadingConv) return (
        <div className="min-h-screen bg-[#070710] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#070710] flex flex-col md:flex-row">

            {/* ── Sidebar ─────────────────────────────────────────────────────── */}
            <div className={`w-full md:w-[320px] flex-shrink-0 border-r border-white/5 flex flex-col bg-[#0c0c1a] ${conversationId ? "hidden md:flex" : "flex"}`}>

                {/* Sidebar Header */}
                <div className="p-5 border-b border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-violet-400" />
                            Messages
                        </h2>
                        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {isConnected ? "Live" : "Offline"}
                        </div>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search conversations…"
                            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConvs.length === 0 ? (
                        <div className="p-8 text-center">
                            <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-600 text-sm">No conversations yet.</p>
                            <p className="text-gray-700 text-xs mt-1">Connect with developers first.</p>
                        </div>
                    ) : (
                        filteredConvs.map(conv => {
                            const other = getOtherParty(conv);
                            const isActive = conv._id === conversationId;
                            return (
                                <motion.div
                                    key={conv._id}
                                    onClick={() => navigate(`/chat/${conv._id}`)}
                                    className={`p-4 cursor-pointer transition-all flex items-center gap-3 border-b border-white/3 relative
                    ${isActive
                                            ? "bg-violet-500/10 border-l-2 border-l-violet-500"
                                            : "hover:bg-white/3 border-l-2 border-l-transparent"
                                        }`}
                                    whileHover={{ x: 2 }}
                                >
                                    {/* Avatar */}
                                    <div className="relative w-11 h-11 flex-shrink-0">
                                        <div className="w-11 h-11 rounded-full overflow-hidden">
                                            {other?.profilePhoto || other?.logo ? (
                                                <img src={other.profilePhoto || other.logo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-violet-600" : "bg-gray-700"} text-white`}>
                                                    {initials(other?.name || other?.companyName)}
                                                </div>
                                            )}
                                        </div>
                                        {/* Online dot (placeholder — would need presence system) */}
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0c0c1a]" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <p className={`font-semibold text-sm truncate ${isActive ? "text-violet-300" : "text-white"}`}>
                                                {other?.name || other?.companyName}
                                            </p>
                                            {conv.lastMessageAt && (
                                                <span className="text-[10px] text-gray-600 ml-2 flex-shrink-0">
                                                    {formatTime(conv.lastMessageAt)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {conv.lastMessage || "Start chatting…"}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Chat Area ───────────────────────────────────────────────────── */}
            <div className={`flex-1 flex flex-col ${!conversationId ? "hidden md:flex items-center justify-center" : "flex"}`}>
                {!conversationId ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-gray-600"
                    >
                        <div className="w-20 h-20 bg-white/3 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-10 h-10 opacity-30" />
                        </div>
                        <p className="text-gray-500 font-medium">Select a conversation</p>
                        <p className="text-gray-700 text-sm mt-1">to start chatting in real-time</p>
                    </motion.div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="px-5 py-4 border-b border-white/5 bg-[#0c0c1a]/80 backdrop-blur-sm flex items-center gap-3">
                            <button onClick={() => navigate("/chat")} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            {activeConv && (() => {
                                const other = getOtherParty(activeConv);
                                return (
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                                {other?.profilePhoto || other?.logo ? (
                                                    <img src={other.profilePhoto || other.logo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                                                        {initials(other?.name || other?.companyName)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0c0c1a]" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm">{other?.name || other?.companyName}</h3>
                                            <p className="text-xs text-emerald-400">● Online</p>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1 bg-gradient-to-b from-[#0a0a18] to-[#070710]">
                            {loadingMsgs && messages.length === 0 ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                    <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
                                    <p className="text-sm">Send a message to start the conversation!</p>
                                </div>
                            ) : (
                                <>
                                    <AnimatePresence initial={false}>
                                        {messages.map((msg, i) => {
                                            const isMine = msg.senderId === user._id;
                                            const prevMsg = messages[i - 1];
                                            const showDateSep = shouldShowDateSep(msg, prevMsg);
                                            const showTime = shouldShowTimestamp(msg, prevMsg);
                                            const isTemp = msg._id.startsWith("temp_");

                                            return (
                                                <React.Fragment key={msg._id}>
                                                    {/* Date separator */}
                                                    {showDateSep && (
                                                        <div className="flex items-center gap-3 py-3">
                                                            <div className="flex-1 h-px bg-white/5" />
                                                            <span className="text-[10px] text-gray-600 font-medium px-2 py-1 bg-white/3 rounded-full">
                                                                {formatDate(msg.createdAt)}
                                                            </span>
                                                            <div className="flex-1 h-px bg-white/5" />
                                                        </div>
                                                    )}

                                                    {/* Timestamp */}
                                                    {!showDateSep && showTime && (
                                                        <div className="flex justify-center py-1">
                                                            <span className="text-[10px] text-gray-700">{formatTime(msg.createdAt)}</span>
                                                        </div>
                                                    )}

                                                    {/* Message bubble */}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        transition={{ duration: 0.15 }}
                                                        className={`flex ${isMine ? "justify-end" : "justify-start"} mb-0.5`}
                                                    >
                                                        <div className={`group max-w-[72%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                ${isMine
                                                                    ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-tr-sm shadow-lg shadow-violet-500/10"
                                                                    : "bg-white/8 text-gray-100 rounded-tl-sm border border-white/8"
                                                                } ${isTemp ? "opacity-60" : ""}`}
                                                            >
                                                                {msg.content}
                                                            </div>
                                                            {/* Read receipt + time */}
                                                            {isMine && (
                                                                <div className="flex items-center gap-1 mt-0.5 px-1">
                                                                    <span className="text-[10px] text-gray-700">{formatTime(msg.createdAt)}</span>
                                                                    {isTemp ? (
                                                                        <Circle className="w-2.5 h-2.5 text-gray-700" />
                                                                    ) : msg.readAt ? (
                                                                        <CheckCheck className="w-3 h-3 text-violet-400" />
                                                                    ) : (
                                                                        <Check className="w-3 h-3 text-gray-600" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </AnimatePresence>

                                    {/* Typing indicator */}
                                    <AnimatePresence>
                                        {typingUser && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 6 }}
                                                className="flex justify-start"
                                            >
                                                <div className="px-4 py-3 bg-white/8 border border-white/8 rounded-2xl rounded-tl-sm">
                                                    <div className="flex gap-1 items-center">
                                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="px-4 py-4 border-t border-white/5 bg-[#0c0c1a]/80 backdrop-blur-sm">
                            <form onSubmit={handleSend} className="flex items-center gap-3">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend(e as any)}
                                    placeholder="Type a message…"
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                                />
                                <motion.button
                                    type="submit"
                                    disabled={!input.trim() || sending}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl flex items-center justify-center text-white hover:from-violet-400 hover:to-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 flex-shrink-0"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                                </motion.button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
