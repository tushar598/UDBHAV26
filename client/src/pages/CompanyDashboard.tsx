import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { motion } from "framer-motion";
import {
    Users, MessageSquare, Handshake, ArrowRight, Building2, Loader2,
    TrendingUp, Clock, Zap, Star, ChevronRight, Search
} from "lucide-react";

interface Stats {
    totalDevelopers: number;
    connections: number;
    pendingRequests: number;
    unreadMessages: number;
}

interface RecentActivity {
    id: string;
    type: "join" | "connection" | "message";
    name: string;
    time: string;
    photo?: string;
}

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const CompanyDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats>({ totalDevelopers: 0, connections: 0, pendingRequests: 0, unreadMessages: 0 });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== "company") { navigate("/company/login"); return; }
        const fetchStats = async () => {
            try {
                const [devRes, connRes, convRes] = await Promise.allSettled([
                    api.get("/company/developers?limit=1"),
                    api.get("/connections?status=accepted"),
                    api.get("/chat/conversations"),
                ]);

                const devData = devRes.status === "fulfilled" ? devRes.value.data : null;
                const connData = connRes.status === "fulfilled" ? connRes.value.data : null;
                const convData = convRes.status === "fulfilled" ? convRes.value.data : null;

                setStats({
                    totalDevelopers: devData?.total || 0,
                    connections: connData?.total || 0,
                    pendingRequests: 0,
                    unreadMessages: convData?.conversations?.length || 0,
                });

                // Build recent activity from connections
                if (connData?.connections) {
                    const acts: RecentActivity[] = connData.connections.slice(0, 5).map((c: any) => ({
                        id: c._id,
                        type: "connection" as const,
                        name: c.userId?.name || "A developer",
                        time: c.createdAt,
                        photo: c.userId?.profilePhoto,
                    }));
                    setRecentActivity(acts);
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        fetchStats();
    }, [user]);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 18) return "Good afternoon";
        return "Good evening";
    };

    const statCards = [
        {
            label: "Developers", value: stats.totalDevelopers,
            icon: Users, gradient: "from-blue-600 to-cyan-500",
            glow: "shadow-blue-500/20", bg: "from-blue-500/10 to-cyan-500/5",
            border: "border-blue-500/20", action: () => navigate("/company/developers"),
            change: "+12 this week"
        },
        {
            label: "Connections", value: stats.connections,
            icon: Handshake, gradient: "from-emerald-600 to-green-500",
            glow: "shadow-emerald-500/20", bg: "from-emerald-500/10 to-green-500/5",
            border: "border-emerald-500/20", action: () => navigate("/company/developers"),
            change: "Active"
        },
        {
            label: "Conversations", value: stats.unreadMessages,
            icon: MessageSquare, gradient: "from-violet-600 to-purple-500",
            glow: "shadow-violet-500/20", bg: "from-violet-500/10 to-purple-500/5",
            border: "border-violet-500/20", action: () => navigate("/chat"),
            change: "Open chats"
        },
    ];

    if (loading) return (
        <div className="min-h-screen bg-[#070710] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-gray-500 text-sm">Loading dashboard…</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#070710] text-white">
            {/* Background gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-6xl mx-auto px-4 py-10">

                {/* ── Hero Header ──────────────────────────────────────────────── */}
                <motion.div
                    variants={fadeUp} initial="hidden" animate="show"
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10"
                >
                    <div className="flex items-center gap-5">
                        {/* Company Avatar */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                                {user?.profilePhoto ? (
                                    <img src={user.profilePhoto} alt="" className="w-full h-full rounded-2xl object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <Building2 className="w-8 h-8 text-gray-900" />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-[#070710] flex items-center justify-center">
                                <Star className="w-2.5 h-2.5 text-gray-900" />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{getGreeting()},</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                                {user?.name}
                            </h1>
                            <p className="text-emerald-400 text-sm flex items-center gap-1 mt-0.5">
                                <Zap className="w-3 h-3" /> Company Dashboard
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); navigate("/company/login"); }}
                        className="px-5 py-2.5 text-sm text-gray-400 border border-white/10 rounded-xl hover:text-red-400 hover:border-red-400/30 transition-all bg-white/3"
                    >
                        Logout
                    </button>
                </motion.div>

                {/* ── Stat Cards ───────────────────────────────────────────────── */}
                <motion.div
                    variants={fadeUp} initial="hidden" animate="show"
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8"
                >
                    {statCards.map((c, i) => (
                        <motion.button
                            key={c.label}
                            onClick={c.action}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className={`relative bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-6 text-left shadow-xl ${c.glow} overflow-hidden group`}
                        >
                            {/* Icon */}
                            <div className={`w-11 h-11 bg-gradient-to-br ${c.gradient} rounded-xl flex items-center justify-center mb-5 shadow-lg`}>
                                <c.icon className="w-5 h-5 text-white" />
                            </div>
                            {/* Value */}
                            <div className="text-4xl font-black text-white mb-1 tabular-nums">{c.value}</div>
                            <div className="text-gray-400 text-sm">{c.label}</div>
                            {/* Change badge */}
                            <div className="mt-3 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 text-xs">{c.change}</span>
                            </div>
                            {/* Arrow */}
                            <ChevronRight className="absolute top-5 right-5 w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                            {/* Glow orb */}
                            <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${c.gradient} opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity`} />
                        </motion.button>
                    ))}
                </motion.div>

                {/* ── Bottom Grid ──────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Quick Actions */}
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="show"
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/3 border border-white/8 rounded-2xl p-6"
                    >
                        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" /> Quick Actions
                        </h2>
                        <div className="space-y-3">
                            {[
                                { label: "Browse Developer Directory", sub: "Find top talent", icon: Search, color: "emerald", action: () => navigate("/company/developers") },
                                { label: "Open Messages", sub: "Chat with developers", icon: MessageSquare, color: "violet", action: () => navigate("/chat") },
                                { label: "View Connections", sub: "Manage your network", icon: Handshake, color: "blue", action: () => navigate("/company/developers") },
                            ].map(item => (
                                <motion.button
                                    key={item.label}
                                    onClick={item.action}
                                    whileHover={{ x: 4 }}
                                    className="w-full flex items-center gap-4 p-4 bg-white/3 border border-white/5 rounded-xl hover:border-white/15 hover:bg-white/6 transition-all group"
                                >
                                    <div className={`w-9 h-9 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                                        <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-white text-sm font-medium">{item.label}</p>
                                        <p className="text-gray-600 text-xs">{item.sub}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="show"
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white/3 border border-white/8 rounded-2xl p-6"
                    >
                        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" /> Recent Connections
                        </h2>
                        {recentActivity.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-700">
                                <Handshake className="w-8 h-8 mb-2 opacity-30" />
                                <p className="text-sm">No connections yet</p>
                                <button
                                    onClick={() => navigate("/company/developers")}
                                    className="text-xs text-emerald-500 hover:underline mt-2"
                                >
                                    Browse developers →
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentActivity.map((act) => (
                                    <div key={act.id} className="flex items-center gap-3 p-3 bg-white/2 rounded-xl border border-white/5">
                                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                                            {act.photo ? (
                                                <img src={act.photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                    {act.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{act.name}</p>
                                            <p className="text-gray-600 text-xs">Connected with you</p>
                                        </div>
                                        <span className="text-[10px] text-gray-700">
                                            {new Date(act.time).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;
