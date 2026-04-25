// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
// import api from "../services/api";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Search, MapPin, Loader2, ChevronLeft, ChevronRight,
//   MessageSquare, Eye, SlidersHorizontal, X, Users, Sparkles
// } from "lucide-react";

// interface Developer {
//   id: string;
//   name: string;
//   profilePhoto: string;
//   skills: string[];
//   skillLevel: string;
//   location: string;
//   githubUsername: string;
//   leetcodeUsername: string;
// }

// const LEVEL_STYLES: Record<string, { badge: string; glow: string; dot: string }> = {
//   advanced: {
//     badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
//     glow: "shadow-emerald-500/10",
//     dot: "bg-emerald-400"
//   },
//   intermediate: {
//     badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
//     glow: "shadow-blue-500/10",
//     dot: "bg-blue-400"
//   },
//   beginner: {
//     badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
//     glow: "shadow-amber-500/10",
//     dot: "bg-amber-400"
//   },
// };

// const SKILL_COLORS = [
//   "bg-blue-500/10 text-blue-400 border-blue-500/20",
//   "bg-violet-500/10 text-violet-400 border-violet-500/20",
//   "bg-pink-500/10 text-pink-400 border-pink-500/20",
//   "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
//   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
//   "bg-orange-500/10 text-orange-400 border-orange-500/20",
// ];

// const getSkillColor = (skill: string) =>
//   SKILL_COLORS[skill.charCodeAt(0) % SKILL_COLORS.length];

// const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// const DeveloperListPage: React.FC = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [developers, setDevelopers] = useState<Developer[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [search, setSearch] = useState("");
//   const [searchInput, setSearchInput] = useState("");
//   const [connecting, setConnecting] = useState<string | null>(null);
//   const [connected, setConnected] = useState<Set<string>>(new Set());
//   const [filterOpen, setFilterOpen] = useState(false);
//   const [levelFilter, setLevelFilter] = useState("");

//   useEffect(() => {
//     if (!user || user.role !== "company") { navigate("/company/login"); return; }
//   }, [user]);

//   const fetchDevelopers = useCallback(async () => {
//     setLoading(true);
//     try {
//       let endpoint = `/company/developers?page=${page}&limit=12`;
//       if (search.trim()) {
//         endpoint = `/company/developers/search?q=${encodeURIComponent(search)}`;
//       }
//       if (levelFilter) {
//         endpoint += (endpoint.includes("?") ? "&" : "?") + `skillLevel=${levelFilter}`;
//       }
//       const res = await api.get(endpoint);
//       setDevelopers(res.data.developers || []);
//       setTotal(res.data.total || 0);
//       setTotalPages(res.data.totalPages || 1);
//     } catch { setDevelopers([]); }
//     setLoading(false);
//   }, [page, search, levelFilter]);

//   useEffect(() => { fetchDevelopers(); }, [fetchDevelopers]);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     setSearch(searchInput);
//     setPage(1);
//   };

//   const handleConnect = async (devId: string) => {
//     setConnecting(devId);
//     try {
//       await api.post("/connections/request", { userId: devId, message: "We'd love to connect with you!" });
//       setConnected(prev => new Set(prev).add(devId));
//     } catch (err: any) {
//       if (err.response?.data?.message?.includes("already exists")) {
//         setConnected(prev => new Set(prev).add(devId));
//       }
//     } finally { setConnecting(null); }
//   };

//   const initials = (name: string) =>
//     name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

//   const levelStyle = (level: string) =>
//     LEVEL_STYLES[level] || { badge: "bg-gray-700/30 text-gray-400 border-gray-600/20", glow: "", dot: "bg-gray-500" };

//   return (
//     <div className="min-h-screen bg-[#070710] text-white">
//       {/* Background */}
//       <div className="fixed inset-0 pointer-events-none">
//         <div className="absolute top-20 left-0 w-72 h-72 bg-blue-500/4 rounded-full blur-3xl" />
//         <div className="absolute bottom-20 right-0 w-72 h-72 bg-violet-500/4 rounded-full blur-3xl" />
//       </div>

//       <div className="relative max-w-7xl mx-auto px-4 py-10">

//         {/* Header */}
//         <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.4 }} className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <div className="w-8 h-8 bg-blue-500/15 border border-blue-500/30 rounded-lg flex items-center justify-center">
//               <Users className="w-4 h-4 text-blue-400" />
//             </div>
//             <h1 className="text-3xl font-black text-white">Developer Directory</h1>
//           </div>
//           <p className="text-gray-500 ml-11">
//             {total > 0 ? (
//               <><span className="text-white font-semibold">{total}</span> developers available</>
//             ) : "Discover top developer talent"}
//           </p>
//         </motion.div>

//         {/* Search + Filter Bar */}
//         <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.4, delay: 0.1 }} className="flex gap-3 mb-6">
//           <form onSubmit={handleSearch} className="flex gap-3 flex-1">
//             <div className="relative flex-1">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
//               <input
//                 value={searchInput}
//                 onChange={e => setSearchInput(e.target.value)}
//                 placeholder="Search by name, skill, location…"
//                 className="w-full pl-11 pr-4 py-3 bg-white/4 border border-white/8 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/40 transition-all text-sm"
//               />
//               {searchInput && (
//                 <button type="button" onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
//                   <X className="w-3.5 h-3.5" />
//                 </button>
//               )}
//             </div>
//             <button type="submit"
//               className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all text-sm">
//               Search
//             </button>
//           </form>
//           <button
//             onClick={() => setFilterOpen(!filterOpen)}
//             className={`px-4 py-3 border rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${filterOpen ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-white/4 border-white/8 text-gray-400 hover:text-white"}`}
//           >
//             <SlidersHorizontal className="w-4 h-4" />
//             Filter
//           </button>
//         </motion.div>

//         {/* Filter Panel */}
//         <AnimatePresence>
//           {filterOpen && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               className="mb-6 overflow-hidden"
//             >
//               <div className="p-4 bg-white/3 border border-white/8 rounded-xl">
//                 <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">Skill Level</p>
//                 <div className="flex flex-wrap gap-2">
//                   {["", "beginner", "intermediate", "advanced"].map(lvl => (
//                     <button key={lvl}
//                       onClick={() => { setLevelFilter(lvl); setPage(1); }}
//                       className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
//                         levelFilter === lvl
//                           ? "bg-blue-500 border-blue-500 text-white"
//                           : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"
//                       }`}
//                     >
//                       {lvl === "" ? "All levels" : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Grid */}
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-24 gap-4">
//             <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
//             <p className="text-gray-600 text-sm">Finding developers…</p>
//           </div>
//         ) : developers.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-24 gap-3">
//             <div className="w-16 h-16 bg-white/3 rounded-2xl flex items-center justify-center">
//               <Users className="w-8 h-8 text-gray-700" />
//             </div>
//             <p className="text-gray-500 font-medium">No developers found</p>
//             <button onClick={() => { setSearch(""); setSearchInput(""); setLevelFilter(""); setPage(1); }}
//               className="text-blue-400 text-sm hover:underline">Clear filters</button>
//           </div>
//         ) : (
//           <motion.div
//             initial="hidden" animate="show"
//             variants={{ show: { transition: { staggerChildren: 0.05 } } }}
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
//           >
//             {developers.map(dev => {
//               const lvl = levelStyle(dev.skillLevel);
//               const isConnected = connected.has(dev.id);

//               return (
//                 <motion.div
//                   key={dev.id}
//                   variants={fadeUp}
//                   whileHover={{ y: -4 }}
//                   className={`relative bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-white/15 hover:bg-white/5 transition-all group cursor-pointer shadow-xl ${lvl.glow}`}
//                 >
//                   {/* Skill level indicator bar */}
//                   <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${
//                     dev.skillLevel === "advanced" ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
//                     dev.skillLevel === "intermediate" ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
//                     dev.skillLevel === "beginner" ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
//                     "bg-white/5"
//                   }`} />

//                   {/* Avatar */}
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="relative">
//                       {dev.profilePhoto ? (
//                         <img
//                           src={dev.profilePhoto} alt={dev.name}
//                           className="w-12 h-12 rounded-xl object-cover border border-white/10"
//                           referrerPolicy="no-referrer"
//                         />
//                       ) : (
//                         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
//                           {initials(dev.name)}
//                         </div>
//                       )}
//                       {dev.githubUsername && (
//                         <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${lvl.dot} border-2 border-[#070710]`} />
//                       )}
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-white font-semibold text-sm truncate">{dev.name}</p>
//                       {dev.location && (
//                         <p className="text-gray-600 text-xs flex items-center gap-1 truncate">
//                           <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{dev.location}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Skill Level Badge */}
//                   {dev.skillLevel && (
//                     <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium mb-3 capitalize ${lvl.badge}`}>
//                       <Sparkles className="w-2.5 h-2.5" />
//                       {dev.skillLevel}
//                     </span>
//                   )}

//                   {/* Skills */}
//                   <div className="flex flex-wrap gap-1.5 mb-4 min-h-[28px]">
//                     {dev.skills.slice(0, 3).map(s => (
//                       <span key={s} className={`text-[11px] px-2 py-0.5 rounded-full border ${getSkillColor(s)}`}>
//                         {s}
//                       </span>
//                     ))}
//                     {dev.skills.length > 3 && (
//                       <span className="text-[11px] px-2 py-0.5 text-gray-600">+{dev.skills.length - 3}</span>
//                     )}
//                   </div>

//                   {/* Actions */}
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => navigate(`/company/developers/${dev.id}`)}
//                       className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 border border-white/8 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all text-xs font-medium"
//                     >
//                       <Eye className="w-3 h-3" /> View
//                     </button>
//                     <button
//                       onClick={() => handleConnect(dev.id)}
//                       disabled={!!connecting || isConnected}
//                       className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
//                         isConnected
//                           ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
//                           : "bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
//                       }`}
//                     >
//                       {connecting === dev.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageSquare className="w-3 h-3" />}
//                       {isConnected ? "Requested" : "Connect"}
//                     </button>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </motion.div>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-center gap-3 mt-10">
//             <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
//               className="p-2.5 bg-white/3 border border-white/8 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 transition-all">
//               <ChevronLeft className="w-5 h-5" />
//             </button>
//             <div className="flex items-center gap-2">
//               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                 const pg = page <= 3 ? i + 1 : page + i - 2;
//                 if (pg < 1 || pg > totalPages) return null;
//                 return (
//                   <button key={pg} onClick={() => setPage(pg)}
//                     className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${pg === page ? "bg-blue-600 text-white" : "bg-white/3 border border-white/8 text-gray-400 hover:text-white"}`}
//                   >{pg}</button>
//                 );
//               })}
//             </div>
//             <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
//               className="p-2.5 bg-white/3 border border-white/8 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 transition-all">
//               <ChevronRight className="w-5 h-5" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DeveloperListPage;

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Loader2, ChevronLeft, ChevronRight,
  MessageSquare, Eye, SlidersHorizontal, X, Users, Sparkles, CheckCircle2
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

const LEVEL_STYLES: Record<string, { badge: string; bar: string; dot: string }> = {
  advanced: {
    badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/25",
    bar: "from-emerald-400 to-green-300",
    dot: "bg-emerald-400",
  },
  intermediate: {
    badge: "bg-sky-400/10 text-sky-400 border-sky-400/25",
    bar: "from-sky-400 to-cyan-300",
    dot: "bg-sky-400",
  },
  beginner: {
    badge: "bg-amber-400/10 text-amber-400 border-amber-400/25",
    bar: "from-amber-400 to-yellow-300",
    dot: "bg-amber-400",
  },
};

const SKILL_COLORS = [
  "bg-green-400/10 text-green-400 border-green-400/20",
  "bg-teal-400/10 text-teal-400 border-teal-400/20",
  "bg-lime-400/10 text-lime-400 border-lime-400/20",
  "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  "bg-green-300/10 text-green-300 border-green-300/20",
];

const getSkillColor = (skill: string) =>
  SKILL_COLORS[skill.charCodeAt(0) % SKILL_COLORS.length];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.055 } },
};

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
      if (search.trim()) endpoint = `/company/developers/search?q=${encodeURIComponent(search)}`;
      if (levelFilter) endpoint += (endpoint.includes("?") ? "&" : "?") + `skillLevel=${levelFilter}`;
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
      if (err.response?.data?.message?.includes("already exists"))
        setConnected(prev => new Set(prev).add(devId));
    } finally { setConnecting(null); }
  };

  const initials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const levelStyle = (level: string) =>
    LEVEL_STYLES[level] || {
      badge: "bg-white/5 text-white/40 border-white/10",
      bar: "from-white/10 to-white/5",
      dot: "bg-white/30",
    };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-green-400/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-green-400/4 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[350px] h-[350px] bg-emerald-400/4 rounded-full blur-[100px]" />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(74,222,128,0.8) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Top accent stripe */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-green-400 to-transparent" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-black/75 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-400 flex items-center justify-center shadow-lg shadow-green-400/30">
              <Users className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white leading-none tracking-tight">DevDirectory</h1>
              <p className="text-[11px] text-white/30 font-medium leading-none mt-0.5">Talent marketplace</p>
            </div>
          </div>

          {total > 0 && (
            <div className="hidden sm:flex items-center gap-2 bg-green-400/8 border border-green-400/20 rounded-full px-3.5 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400" />
              <span className="text-xs font-semibold text-green-400">{total} developers available</span>
            </div>
          )}
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero Title */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Find your next{" "}
            <span className="text-green-400 relative inline-block">
              developer
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-green-400/60 to-transparent rounded-full" />
            </span>
            .
          </h2>
          <p className="text-white/35 mt-3 text-sm sm:text-base max-w-md">
            Browse verified talent, filter by skill level, and connect instantly.
          </p>
        </motion.div>

        {/* Search + Filter Bar */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.08 }}
          className="flex flex-col sm:flex-row gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex gap-2.5 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by name, skill, or location…"
                className="w-full pl-10 pr-9 py-3 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-green-400/50 focus:border-green-400/50 transition-all text-sm"
              />
              {searchInput && (
                <button type="button"
                  onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button type="submit"
              className="px-5 py-3 bg-green-400 hover:bg-green-300 active:scale-95 text-black font-bold rounded-xl transition-all text-sm shadow-lg shadow-green-400/20 whitespace-nowrap">
              Search
            </button>
          </form>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-xl text-sm font-semibold transition-all ${
              filterOpen
                ? "bg-green-400/10 border-green-400/40 text-green-400"
                : "bg-white/[0.04] border-white/[0.09] text-white/40 hover:border-green-400/30 hover:text-green-400"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {levelFilter && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
          </button>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                <p className="text-[11px] font-bold text-white/25 uppercase tracking-widest mb-3">Skill Level</p>
                <div className="flex flex-wrap gap-2">
                  {["", "beginner", "intermediate", "advanced"].map(lvl => (
                    <button key={lvl}
                      onClick={() => { setLevelFilter(lvl); setPage(1); }}
                      className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                        levelFilter === lvl
                          ? "bg-green-400 border-green-400 text-black shadow-md shadow-green-400/20"
                          : "bg-white/[0.04] border-white/10 text-white/40 hover:border-green-400/30 hover:text-green-400"
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

        {/* Active filter chips */}
        {(search || levelFilter) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2 mb-5">
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-400/10 border border-green-400/25 text-green-400 text-xs font-semibold rounded-full">
                "{search}"
                <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {levelFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-400/10 border border-green-400/25 text-green-400 text-xs font-semibold rounded-full capitalize">
                {levelFilter}
                <button onClick={() => { setLevelFilter(""); setPage(1); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </motion.div>
        )}

        {/* Loading / Empty / Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-green-400 animate-spin" />
            </div>
            <p className="text-white/25 text-sm font-medium">Finding developers…</p>
          </div>
        ) : developers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Users className="w-8 h-8 text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">No developers found</p>
              <p className="text-white/30 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
            <button
              onClick={() => { setSearch(""); setSearchInput(""); setLevelFilter(""); setPage(1); }}
              className="px-5 py-2 bg-green-400 text-black text-sm font-bold rounded-xl hover:bg-green-300 transition-all shadow-lg shadow-green-400/20">
              Clear all filters
            </button>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {developers.map(dev => {
              const lvl = levelStyle(dev.skillLevel);
              const isConnected = connected.has(dev.id);

              return (
                <motion.div
                  key={dev.id}
                  variants={fadeUp}
                  whileHover={{ y: -5 }}
                  className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 hover:border-green-400/25 hover:bg-white/[0.06] transition-all group overflow-hidden cursor-pointer"
                >
                  {/* Top gradient bar */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${lvl.bar}`} />

                  {/* Hover radial glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.07) 0%, transparent 65%)" }} />

                  {/* Avatar row */}
                  <div className="flex items-center gap-3 mb-4 relative">
                    <div className="relative flex-shrink-0">
                      {dev.profilePhoto ? (
                        <img
                          src={dev.profilePhoto} alt={dev.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black font-extrabold text-sm shadow-lg shadow-green-400/20">
                          {initials(dev.name)}
                        </div>
                      )}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${lvl.dot}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold text-sm truncate leading-tight">{dev.name}</p>
                      {dev.location && (
                        <p className="text-white/30 text-xs flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-green-400/60" />
                          {dev.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Skill Level Badge */}
                  {dev.skillLevel && (
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold mb-3 capitalize ${lvl.badge}`}>
                      <Sparkles className="w-2.5 h-2.5" />
                      {dev.skillLevel}
                    </span>
                  )}

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-5 min-h-[26px]">
                    {dev.skills.slice(0, 3).map(s => (
                      <span key={s} className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${getSkillColor(s)}`}>
                        {s}
                      </span>
                    ))}
                    {dev.skills.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5 text-white/25 font-medium">
                        +{dev.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 relative">
                    <button
                      onClick={() => navigate(`/company/developers/${dev.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.05] border border-white/10 text-white/45 rounded-xl hover:bg-white/10 hover:text-white hover:border-white/20 transition-all text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => handleConnect(dev.id)}
                      disabled={!!connecting || isConnected}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isConnected
                          ? "bg-green-400/10 text-green-400 border border-green-400/25 cursor-default"
                          : "bg-green-400 text-black hover:bg-green-300 active:scale-95 shadow-md shadow-green-400/15 disabled:opacity-50"
                      }`}
                    >
                      {connecting === dev.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : isConnected
                          ? <CheckCircle2 className="w-3.5 h-3.5" />
                          : <MessageSquare className="w-3.5 h-3.5" />
                      }
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
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-10"
          >
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/35 hover:text-green-400 hover:border-green-400/30 disabled:opacity-25 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page <= 3 ? i + 1 : page + i - 2;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      pg === page
                        ? "bg-green-400 text-black shadow-md shadow-green-400/20"
                        : "bg-white/[0.04] border border-white/[0.08] text-white/35 hover:border-green-400/30 hover:text-green-400"
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/35 hover:text-green-400 hover:border-green-400/30 disabled:opacity-25 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <p className="text-center text-xs text-white/10 mt-10 font-medium">
          All developer profiles are verified · DevDirectory
        </p>
      </div>
    </div>
  );
};

export default DeveloperListPage;