import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, MapPin, Loader2, ChevronLeft, ChevronRight,
    MessageSquare, Eye, SlidersHorizontal, X, Users, Sparkles
} from "lucide-react";

interface Developer {
    id: string;
    name: string;
    profilePhoto: string;
    skills: string[];
    skillLevel: string;
    location: string;
    githubUsername: string;
    leetcodeUsername: string;
}

const LEVEL_STYLES: Record<string, { badge: string; glow: string; dot: string }> = {
    advanced: {
        badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        glow: "shadow-emerald-500/10",
        dot: "bg-emerald-400"
    },
    intermediate: {
        badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        glow: "shadow-blue-500/10",
        dot: "bg-blue-400"
    },
    beginner: {
        badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        glow: "shadow-amber-500/10",
        dot: "bg-amber-400"
    },
};

const SKILL_COLORS = [
    "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "bg-violet-500/10 text-violet-400 border-violet-500/20",
    "bg-pink-500/10 text-pink-400 border-pink-500/20",
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "bg-orange-500/10 text-orange-400 border-orange-500/20",
];

const getSkillColor = (skill: string) =>
    SKILL_COLORS[skill.charCodeAt(0) % SKILL_COLORS.length];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const DeveloperListPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [connecting, setConnecting] = useState<string | null>(null);
    const [connected, setConnected] = useState<Set<string>>(new Set());
    const [filterOpen, setFilterOpen] = useState(false);
    const [levelFilter, setLevelFilter] = useState("");

    useEffect(() => {
        if (!user || user.role !== "company") { navigate("/company/login"); return; }
    }, [user]);

    const fetchDevelopers = useCallback(async () => {
        setLoading(true);
        try {
            let endpoint = `/company/developers?page=${page}&limit=12`;
            if (search.trim()) {
                endpoint = `/company/developers/search?q=${encodeURIComponent(search)}`;
            }
            if (levelFilter) {
                endpoint += (endpoint.includes("?") ? "&" : "?") + `skillLevel=${levelFilter}`;
            }
            const res = await api.get(endpoint);
            setDevelopers(res.data.developers || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.totalPages || 1);
        } catch { setDevelopers([]); }
        setLoading(false);
    }, [page, search, levelFilter]);

    useEffect(() => { fetchDevelopers(); }, [fetchDevelopers]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleConnect = async (devId: string) => {
        setConnecting(devId);
        try {
            await api.post("/connections/request", { userId: devId, message: "We'd love to connect with you!" });
            setConnected(prev => new Set(prev).add(devId));
        } catch (err: any) {
            if (err.response?.data?.message?.includes("already exists")) {
                setConnected(prev => new Set(prev).add(devId));
            }
        } finally { setConnecting(null); }
    };

    const initials = (name: string) =>
        name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    const levelStyle = (level: string) =>
        LEVEL_STYLES[level] || { badge: "bg-gray-700/30 text-gray-400 border-gray-600/20", glow: "", dot: "bg-gray-500" };

    return (
        <div className="min-h-screen bg-[#070710] text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-20 left-0 w-72 h-72 bg-blue-500/4 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-0 w-72 h-72 bg-violet-500/4 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-10">

                {/* Header */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.4 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-500/15 border border-blue-500/30 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white">Developer Directory</h1>
                    </div>
                    <p className="text-gray-500 ml-11">
                        {total > 0 ? (
                            <><span className="text-white font-semibold">{total}</span> developers available</>
                        ) : "Discover top developer talent"}
                    </p>
                </motion.div>

                {/* Search + Filter Bar */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.1 }} className="flex gap-3 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-3 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                placeholder="Search by name, skill, location…"
                                className="w-full pl-11 pr-4 py-3 bg-white/4 border border-white/8 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/40 transition-all text-sm"
                            />
                            {searchInput && (
                                <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        <button type="submit"
                            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all text-sm">
                            Search
                        </button>
                    </form>
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className={`px-4 py-3 border rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${filterOpen ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-white/4 border-white/8 text-gray-400 hover:text-white"}`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filter
                    </button>
                </motion.div>

                {/* Filter Panel */}
                <AnimatePresence>
                    {filterOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="p-4 bg-white/3 border border-white/8 rounded-xl">
                                <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Skill Level</p>
                                <div className="flex flex-wrap gap-2">
                                    {["", "beginner", "intermediate", "advanced"].map(lvl => (
                                        <button key={lvl}
                                            onClick={() => { setLevelFilter(lvl); setPage(1); }}
                                            className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${levelFilter === lvl
                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                    : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"
                                                }`}
                                        >
                                            {lvl === "" ? "All levels" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        <p className="text-gray-600 text-sm">Finding developers…</p>
                    </div>
                ) : developers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-16 h-16 bg-white/3 rounded-2xl flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-700" />
                        </div>
                        <p className="text-gray-500 font-medium">No developers found</p>
                        <button onClick={() => { setSearch(""); setSearchInput(""); setLevelFilter(""); setPage(1); }}
                            className="text-blue-400 text-sm hover:underline">Clear filters</button>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden" animate="show"
                        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        {developers.map(dev => {
                            const lvl = levelStyle(dev.skillLevel);
                            const isConnected = connected.has(dev.id);

                            return (
                                <motion.div
                                    key={dev.id}
                                    variants={fadeUp}
                                    whileHover={{ y: -4 }}
                                    className={`relative bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-white/15 hover:bg-white/5 transition-all group cursor-pointer shadow-xl ${lvl.glow}`}
                                >
                                    {/* Skill level indicator bar */}
                                    <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${dev.skillLevel === "advanced" ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
                                            dev.skillLevel === "intermediate" ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
                                                dev.skillLevel === "beginner" ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                                                    "bg-white/5"
                                        }`} />

                                    {/* Avatar */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="relative">
                                            {dev.profilePhoto ? (
                                                <img
                                                    src={dev.profilePhoto} alt={dev.name}
                                                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {initials(dev.name)}
                                                </div>
                                            )}
                                            {dev.githubUsername && (
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${lvl.dot} border-2 border-[#070710]`} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-semibold text-sm truncate">{dev.name}</p>
                                            {dev.location && (
                                                <p className="text-gray-600 text-xs flex items-center gap-1 truncate">
                                                    <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{dev.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Skill Level Badge */}
                                    {dev.skillLevel && (
                                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium mb-3 capitalize ${lvl.badge}`}>
                                            <Sparkles className="w-2.5 h-2.5" />
                                            {dev.skillLevel}
                                        </span>
                                    )}

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-1.5 mb-4 min-h-[28px]">
                                        {dev.skills.slice(0, 3).map(s => (
                                            <span key={s} className={`text-[11px] px-2 py-0.5 rounded-full border ${getSkillColor(s)}`}>
                                                {s}
                                            </span>
                                        ))}
                                        {dev.skills.length > 3 && (
                                            <span className="text-[11px] px-2 py-0.5 text-gray-600">+{dev.skills.length - 3}</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/company/developers/${dev.id}`)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 border border-white/8 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all text-xs font-medium"
                                        >
                                            <Eye className="w-3 h-3" /> View
                                        </button>
                                        <button
                                            onClick={() => handleConnect(dev.id)}
                                            disabled={!!connecting || isConnected}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${isConnected
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
                                                }`}
                                        >
                                            {connecting === dev.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
                                            {isConnected ? "Requested" : "Connect"}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-10">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="p-2.5 bg-white/3 border border-white/8 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pg = page <= 3 ? i + 1 : page + i - 2;
                                if (pg < 1 || pg > totalPages) return null;
                                return (
                                    <button key={pg} onClick={() => setPage(pg)}
                                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${pg === page ? "bg-blue-600 text-white" : "bg-white/3 border border-white/8 text-gray-400 hover:text-white"}`}
                                    >{pg}</button>
                                );
                            })}
                        </div>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="p-2.5 bg-white/3 border border-white/8 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeveloperListPage;
