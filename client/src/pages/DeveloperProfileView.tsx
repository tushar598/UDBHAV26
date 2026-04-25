import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import LeetCodeSection from "../components/LeetCodeSection";
import GitHubHeatmap from "../components/GitHubHeatmap";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Github, ArrowLeft, Loader2, MessageSquare, Star,
  GitFork, ExternalLink, Code2, Activity, Trophy, Sparkles, Send, CheckCircle2
} from "lucide-react";

interface DevProfile {
  id: string; name: string; email: string; profilePhoto: string;
  location: string; skills: string[]; skillLevel: string; skillLevelAnalysis: string;
  githubUsername: string; githubRepos: any[]; leetcodeUsername: string;
  desiredPost: string[]; createdAt: string;
}

const TABS = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "github",   label: "GitHub",   icon: Github  },
  { id: "leetcode", label: "LeetCode", icon: Trophy  },
] as const;

type Tab = (typeof TABS)[number]["id"];

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f7df1e", TypeScript: "#3178c6", Python: "#3572A5",
  Java: "#b07219", "C++": "#f34b7d", Go: "#00add8", Rust: "#dea584",
  Swift: "#fa7343", Kotlin: "#A97BFF", Ruby: "#701516", PHP: "#4f5d95",
  CSS: "#563d7c", HTML: "#e34c26", Shell: "#89e051",
};
const getLangColor = (lang: string) => LANG_COLORS[lang] || "#4ade80";

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

const levelConfig: Record<string, { badge: string; bar: string; dot: string; analysis: string }> = {
  advanced: {
    badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/25",
    bar:   "from-emerald-400 to-green-300",
    dot:   "bg-emerald-400",
    analysis: "bg-emerald-400/6 border-emerald-400/20",
  },
  intermediate: {
    badge: "bg-sky-400/10 text-sky-400 border-sky-400/25",
    bar:   "from-sky-400 to-cyan-300",
    dot:   "bg-sky-400",
    analysis: "bg-sky-400/6 border-sky-400/20",
  },
  beginner: {
    badge: "bg-amber-400/10 text-amber-400 border-amber-400/25",
    bar:   "from-amber-400 to-yellow-300",
    dot:   "bg-amber-400",
    analysis: "bg-amber-400/6 border-amber-400/20",
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] } },
};

const DeveloperProfileView: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [profile,    setProfile]    = useState<DevProfile | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connected,  setConnected]  = useState(false);
  const [error,      setError]      = useState("");
  const [activeTab,  setActiveTab]  = useState<Tab>("overview");

  useEffect(() => {
    if (!user || user.role !== "company") { navigate("/company/login"); return; }
    (async () => {
      try {
        const res = await api.get(`/company/developers/${userId}/profile`);
        setProfile(res.data);
      } catch (e: any) {
        setError(e.response?.data?.message || "Failed to load profile");
      }
      setLoading(false);
    })();
  }, [userId, user]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await api.post("/connections/request", { userId, message: "We'd love to connect!" });
      setConnected(true);
    } catch (e: any) {
      if (e.response?.data?.message?.includes("already exists")) setConnected(true);
    } finally { setConnecting(false); }
  };

  const initials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-green-400 animate-spin" />
        </div>
        <p className="text-white/25 text-sm font-medium">Loading profile…</p>
      </div>
    </div>
  );

  /* ── Error ────────────────────────────────────────────────── */
  if (error || !profile) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <p className="text-red-400 text-sm">{error || "Profile not found"}</p>
      <button onClick={() => navigate(-1)}
        className="text-green-400 text-sm hover:underline">Go back</button>
    </div>
  );

  const lvl = levelConfig[profile.skillLevel] || levelConfig.beginner;

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-green-400/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40  w-[400px] h-[400px] bg-green-400/4 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[350px] h-[350px] bg-emerald-400/4 rounded-full blur-[100px]" />
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

      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-black/75 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/35 hover:text-green-400 transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Developers</span>
            <span className="sm:hidden">Back</span>
          </button>

        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Hero Card ─────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="show"
          className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden mb-6"
        >
          {/* Top gradient bar */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${lvl.bar}`} />

          {/* Cover band */}
          <div className={`h-24 sm:h-28 bg-gradient-to-r ${lvl.bar} opacity-[0.08]`} />

          {/* Hover radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.05) 0%, transparent 60%)" }}
          />

          <div className="px-5 sm:px-8 pb-7">
            {/* Avatar row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-12 mb-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-[3px] border-black overflow-hidden shadow-xl">
                  {profile.profilePhoto ? (
                    <img src={profile.profilePhoto} alt={profile.name}
                      className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black font-extrabold text-2xl`}>
                      {initials(profile.name)}
                    </div>
                  )}
                </div>
                {/* Level dot */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${lvl.dot}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{profile.name}</h1>
                      {profile.skillLevel && (
                        <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border font-semibold capitalize ${lvl.badge}`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          {profile.skillLevel}
                        </span>
                      )}
                    </div>
                    {profile.location && (
                      <p className="text-white/30 text-xs flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-3 h-3 text-green-400/60" />
                        {profile.location}
                      </p>
                    )}
                    {profile.desiredPost.length > 0 && (
                      <p className="text-white/25 text-xs mt-1">
                        Looking for: <span className="text-white/40">{profile.desiredPost.join(", ")}</span>
                      </p>
                    )}
                  </div>

                  {/* Desktop action buttons */}
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    {profile.githubUsername && (
                      <a href={`https://github.com/${profile.githubUsername}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white/40 hover:text-white hover:border-white/20 transition-all">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    <motion.button
                      onClick={handleConnect}
                      disabled={connecting || connected}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        connected
                          ? "bg-green-400/10 text-green-400 border border-green-400/25"
                          : "bg-green-400 text-black hover:bg-green-300 shadow-lg shadow-green-400/20 disabled:opacity-50"
                      }`}
                    >
                      {connecting ? <Loader2 className="w-4 h-4 animate-spin" />
                        : connected ? <CheckCircle2 className="w-4 h-4" />
                        : <Send className="w-4 h-4" />}
                      {connected ? "Requested" : "Connect"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills pills */}
            {profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map(s => (
                  <span key={s} className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${getSkillColor(s)}`}>
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Mobile connect button */}
            <div className="sm:hidden mt-4 flex gap-2">
              {profile.githubUsername && (
                <a href={`https://github.com/${profile.githubUsername}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                  <Github className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={handleConnect}
                disabled={connecting || connected}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  connected
                    ? "bg-green-400/10 text-green-400 border border-green-400/25"
                    : "bg-green-400 text-black hover:bg-green-300 shadow-md shadow-green-400/20 disabled:opacity-50"
                }`}
              >
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" />
                  : connected ? <CheckCircle2 className="w-4 h-4" />
                  : <Send className="w-4 h-4" />}
                {connected ? "Requested" : "Connect"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{ delay: 0.08 }}>
          <div className="flex gap-1 mb-6 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl w-fit">
            {TABS.map(tab => {
              const visible =
                tab.id === "overview" ||
                (tab.id === "github"   && (profile.githubUsername || profile.githubRepos.length > 0)) ||
                (tab.id === "leetcode" && profile.leetcodeUsername);
              if (!visible && tab.id !== "overview") return null;
              return (
                <button key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-green-400 text-black shadow-md shadow-green-400/20"
                      : "text-white/35 hover:text-white/60"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Tab Panels ───────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-4">

                {/* AI Skill Analysis */}
                {profile.skillLevelAnalysis && (
                  <div className={`p-5 border rounded-2xl ${lvl.analysis}`}>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <h3 className="text-sm font-bold text-white">AI Skill Assessment</h3>
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold capitalize ${lvl.badge}`}>
                        {profile.skillLevel}
                      </span>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">{profile.skillLevelAnalysis}</p>
                  </div>
                )}

                {/* Desired Roles */}
                {profile.desiredPost.length > 0 && (
                  <div className="p-5 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-green-400" /> Open To Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.desiredPost.map(role => (
                        <span key={role}
                          className="text-sm px-3 py-1.5 bg-green-400/10 border border-green-400/20 text-green-400 rounded-xl font-medium">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Skills */}
                {profile.skills.length > 0 && (
                  <div className="p-5 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-green-400" /> Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map(s => (
                        <span key={s} className={`px-3 py-1 text-sm rounded-full border font-medium ${getSkillColor(s)}`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GITHUB */}
            {activeTab === "github" && (
              <div className="space-y-4">

                {/* Heatmap */}
                {profile.githubUsername && (
                  <div className="p-5 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-green-400" /> Contribution Activity
                    </h3>
                    <GitHubHeatmap githubUsername={profile.githubUsername} publicMode={true} />
                  </div>
                )}

                {/* Repos */}
                {profile.githubRepos.length > 0 && (
                  <div className="p-5 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
                    <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Github className="w-3.5 h-3.5 text-white/50" /> Pinned Repositories
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.githubRepos.slice(0, 6).map((repo: any, i: number) => (
                        <a key={i} href={repo.url} target="_blank" rel="noopener noreferrer"
                          className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:border-green-400/25 hover:bg-white/[0.06] transition-all group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-white text-sm font-semibold truncate group-hover:text-green-400 transition-colors">
                              {repo.name}
                            </p>
                            <ExternalLink className="w-3 h-3 text-white/15 group-hover:text-green-400/60 flex-shrink-0 ml-2 mt-0.5 transition-colors" />
                          </div>
                          {repo.description && (
                            <p className="text-white/25 text-xs mb-3 line-clamp-2 leading-relaxed">{repo.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-white/25">
                            {repo.language && (
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: getLangColor(repo.language) }} />
                                {repo.language}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />{repo.stars}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />{repo.forks}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LEETCODE */}
            {activeTab === "leetcode" && profile.leetcodeUsername && (
              <div className="p-5 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
                <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" /> LeetCode Stats
                </h3>
                <LeetCodeSection username={profile.leetcodeUsername} />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeveloperProfileView;