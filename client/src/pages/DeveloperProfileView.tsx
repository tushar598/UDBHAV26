import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import LeetCodeSection from "../components/LeetCodeSection";
import GitHubHeatmap from "../components/GitHubHeatmap";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin, Github, ArrowLeft, Loader2, MessageSquare, Star,
    GitFork, ExternalLink, Code2, Activity, Trophy, Sparkles, Send
} from "lucide-react";

interface DevProfile {
    id: string; name: string; email: string; profilePhoto: string;
    location: string; skills: string[]; skillLevel: string; skillLevelAnalysis: string;
    githubUsername: string; githubRepos: any[]; leetcodeUsername: string;
    desiredPost: string[]; createdAt: string;
}

const TABS = [
    { id: "overview", label: "Overview", icon: Sparkles },
    { id: "github", label: "GitHub", icon: Github },
    { id: "leetcode", label: "LeetCode", icon: Trophy },
] as const;

type Tab = (typeof TABS)[number]["id"];

const LANG_COLORS: Record<string, string> = {
    JavaScript: "#f7df1e", TypeScript: "#3178c6", Python: "#3572A5",
    Java: "#b07219", "C++": "#f34b7d", Go: "#00add8", Rust: "#dea584",
    Swift: "#fa7343", Kotlin: "#A97BFF", Ruby: "#701516", PHP: "#4f5d95",
    CSS: "#563d7c", HTML: "#e34c26", Shell: "#89e051",
};

const getLangColor = (lang: string) => LANG_COLORS[lang] || "#8b949e";

const levelConfig: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    advanced: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", gradient: "from-emerald-500 to-teal-400" },
    intermediate: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30", gradient: "from-blue-500 to-cyan-400" },
    beginner: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", gradient: "from-amber-500 to-yellow-400" },
};

const DeveloperProfileView: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<DevProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    useEffect(() => {
        if (!user || user.role !== "company") { navigate("/company/login"); return; }
        const fetch = async () => {
            try {
                const res = await api.get(`/company/developers/${userId}/profile`);
                setProfile(res.data);
            } catch (e: any) { setError(e.response?.data?.message || "Failed to load profile"); }
            setLoading(false);
        };
        fetch();
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

    if (loading) return (
        <div className= "min-h-screen bg-[#070710] flex items-center justify-center" >
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
  );

if (error || !profile) return (
    <div className= "min-h-screen bg-[#070710] flex flex-col items-center justify-center gap-4" >
    <p className="text-red-400" > { error || "Profile not found"}</p>
        <button onClick={() => navigate(-1)} className="text-blue-400 underline text-sm"> Go back </button>
            </div>
  );

const lvl = levelConfig[profile.skillLevel] || levelConfig.beginner;

return (
    <div className= "min-h-screen bg-[#070710] text-white" >
    {/* Background orbs */ }
    < div className = "fixed inset-0 pointer-events-none overflow-hidden" >
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/4 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/4 rounded-full blur-3xl" />
        </div>

                < div className = "relative max-w-5xl mx-auto px-4 py-8" >

                    {/* Back */ }
                    < button
onClick = {() => navigate(-1)}
className = "flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors text-sm group"
    >
    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Developers
            </button>

{/* ── Hero Card ──────────────────────────────────────────────── */ }
<motion.div
          initial={ { opacity: 0, y: 20 } }
animate = {{ opacity: 1, y: 0 }}
className = "relative bg-white/3 border border-white/8 rounded-3xl overflow-hidden mb-6 shadow-2xl"
    >
    {/* Cover gradient */ }
    < div className = {`h-28 bg-gradient-to-r ${lvl.gradient} opacity-20`} />
{/* Skills level bar */ }
<div className={ `absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${lvl.gradient}` } />

    < div className = "px-6 sm:px-8 pb-8" >
        {/* Avatar (overlapping cover) */ }
        < div className = "flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-14 mb-5" >
            <div className="relative" >
                <div className="w-24 h-24 rounded-2xl border-4 border-[#070710] overflow-hidden shadow-xl" >
                    {
                        profile.profilePhoto ? (
                            <img src= { profile.profilePhoto } alt={ profile.name }
                      className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${lvl.gradient} flex items-center justify-center text-white font-bold text-2xl`}>
                            { initials(profile.name)}
</div>
                  )}
</div>
{
    profile.skillLevel && (
        <span className={ `absolute -bottom-2 -right-2 text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${lvl.bg} ${lvl.text} ${lvl.border}` }>
            { profile.skillLevel }
            </span>
                )
}
</div>
{/* Spacer on mobile */ }
<div className="flex-1 mt-2 sm:mt-0" >
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" >
        <div>
        <h1 className="text-2xl font-black text-white" > { profile.name } </h1>
{
    profile.location && (
        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1" >
            <MapPin className="w-3.5 h-3.5" /> { profile.location }
                </p>
                    )
}
{
    profile.desiredPost.length > 0 && (
        <p className="text-gray-600 text-xs mt-1" >
            Looking for: { profile.desiredPost.join(", ") }
    </p>
                    )
}
</div>
{/* Actions */ }
<div className="flex items-center gap-3 flex-wrap" >
{
    profile.githubUsername && (
        <a href={ `https://github.com/${profile.githubUsername}` } target = "_blank" rel = "noopener noreferrer"
className = "p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all" >
    <Github className="w-4 h-4" />
        </a>
                    )}
<motion.button
                      onClick={ handleConnect }
disabled = { connecting || connected}
whileHover = {{ scale: 1.03 }}
whileTap = {{ scale: 0.97 }}
className = {`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${connected
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
        : "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/15"
    }`}
                    >
    { connecting?<Loader2 className = "w-4 h-4 animate-spin" /> : connected ? <MessageSquare className="w-4 h-4" /> : <Send className="w-4 h-4" />}
{ connected ? "Request Sent" : "Connect" }
</motion.button>
    </div>
    </div>
    </div>
    </div>

{/* Skills preview */ }
{
    profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-2" >
        {
            profile.skills.map(s => (
                <span key= { s } className = "text-xs px-3 py-1 bg-white/5 border border-white/8 text-gray-300 rounded-full" >
                { s }
                </span>
            ))
        }
            </div>
            )
}
</div>
    </motion.div>

{/* ── Tabs ─────────────────────────────────────────────────── */ }
<div className="flex gap-1 mb-6 p-1 bg-white/3 border border-white/8 rounded-xl w-fit" >
{
    TABS.map(tab => {
        const visible =
            tab.id === "overview" ||
            (tab.id === "github" && (profile.githubUsername || profile.githubRepos.length > 0)) ||
            (tab.id === "leetcode" && profile.leetcodeUsername);
        if (!visible) return null;
        return (
            <button key= { tab.id }
        onClick = {() => setActiveTab(tab.id)
    }
                className = {`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
    >
    <tab.icon className="w-3.5 h-3.5" />
        { tab.label }
        </button>
            );
          })}
</div>

{/* ── Tab Panels ─────────────────────────────────────────────── */ }
<AnimatePresence mode="wait" >
    <motion.div
            key={ activeTab }
initial = {{ opacity: 0, y: 10 }}
animate = {{ opacity: 1, y: 0 }}
exit = {{ opacity: 0, y: -10 }}
transition = {{ duration: 0.2 }}
          >

    {/* OVERVIEW */ }
{
    activeTab === "overview" && (
        <div className="space-y-5" >
            {/* AI Skill Analysis */ }
    {
        profile.skillLevelAnalysis && (
            <div className={ `p-5 ${lvl.bg} border ${lvl.border} rounded-2xl` }>
                <div className="flex items-center gap-2 mb-3" >
                    <Sparkles className={ `w-4 h-4 ${lvl.text}` } />
                        < h3 className = {`text-sm font-bold ${lvl.text}`
    }> AI Skill Assessment </h3>
        < span className = {`text-xs px-2 py-0.5 rounded-full border capitalize font-medium ${lvl.bg} ${lvl.text} ${lvl.border}`
}>
    { profile.skillLevel }
    </span>
    </div>
    < p className = "text-gray-300 text-sm leading-relaxed" > { profile.skillLevelAnalysis } </p>
        </div>
                )}

{/* Desired Roles */ }
{
    profile.desiredPost.length > 0 && (
        <div className="p-5 bg-white/3 border border-white/8 rounded-2xl" >
            <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2" >
                <Code2 className="w-4 h-4" /> Open To Roles
                    </h3>
                    < div className = "flex flex-wrap gap-2" >
                    {
                        profile.desiredPost.map(role => (
                            <span key= { role } className = "text-sm px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-lg" >
                            { role }
                            </span>
                        ))
                    }
                        </div>
                        </div>
                )
}

{/* All Skills */ }
{
    profile.skills.length > 0 && (
        <div className="p-5 bg-white/3 border border-white/8 rounded-2xl" >
            <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2" >
                <Sparkles className="w-4 h-4" /> Skills
                    </h3>
                    < div className = "flex flex-wrap gap-2" >
                    {
                        profile.skills.map(s => (
                            <span key= { s } className = "px-3 py-1 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-full" >
                            { s }
                            </span>
                        ))
                    }
                        </div>
                        </div>
                )
}
</div>
            )}

{/* GITHUB */ }
{
    activeTab === "github" && (
        <div className="space-y-5" >
            {/* Heatmap — publicMode=true so company sees developer's data */ }
    {
        profile.githubUsername && (
            <div className="p-5 bg-white/3 border border-white/8 rounded-2xl" >
                <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2" >
                    <Activity className="w-4 h-4 text-green-400" /> Contribution Activity
                        </h3>
                        < GitHubHeatmap
        githubUsername = { profile.githubUsername }
        publicMode = { true}
            />
            </div>
                )
    }

    {/* Repos */ }
    {
        profile.githubRepos.length > 0 && (
            <div className="p-5 bg-white/3 border border-white/8 rounded-2xl" >
                <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2" >
                    <Github className="w-4 h-4 text-white" /> Pinned Repositories
                        </h3>
                        < div className = "grid grid-cols-1 sm:grid-cols-2 gap-3" >
                        {
                            profile.githubRepos.slice(0, 6).map((repo: any, i: number) => (
                                <a key= { i } href = { repo.url } target = "_blank" rel = "noopener noreferrer"
                          className = "p-4 bg-white/3 border border-white/8 rounded-xl hover:border-white/15 hover:bg-white/5 transition-all group"
                                >
                                <div className="flex items-start justify-between mb-2" >
                            <p className="text-white text-sm font-semibold truncate group-hover:text-blue-400 transition-colors" >
                            { repo.name }
                            </p>
                            < ExternalLink className = "w-3 h-3 text-gray-700 group-hover:text-gray-400 flex-shrink-0 ml-2 mt-0.5 transition-colors" />
                            </div>
                          {
                                    repo.description && (
                                        <p className="text-gray-600 text-xs mb-3 line-clamp-2"> { repo.description } </p>
                          )
                        }
                            < div className = "flex items-center gap-3 text-xs text-gray-600" >
                            {
                                repo.language && (
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style = {{ backgroundColor: getLangColor(repo.language) }
    } />
    { repo.language }
    </span>
                            )
}
<span className="flex items-center gap-1" >
    <Star className="w-3 h-3" /> { repo.stars }
        </span>
        < span className = "flex items-center gap-1" >
            <GitFork className="w-3 h-3" /> { repo.forks }
                </span>
                </div>
                </a>
                      ))}
</div>
    </div>
                )}
</div>
            )}

{/* LEETCODE */ }
{
    activeTab === "leetcode" && profile.leetcodeUsername && (
        <div className="p-5 bg-white/3 border border-white/8 rounded-2xl" >
            <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2" >
                <Trophy className="w-4 h-4 text-yellow-400" /> LeetCode Stats
                    </h3>
                    < LeetCodeSection username = { profile.leetcodeUsername } />
                        </div>
            )
}
</motion.div>
    </AnimatePresence>
    </div>
    </div>
  );
};

export default DeveloperProfileView;
