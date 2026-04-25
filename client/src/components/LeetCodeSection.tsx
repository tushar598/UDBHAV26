import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Trophy, Code, Target, Award, Loader2 } from "lucide-react";

interface LeetCodeStats {
    username: string;
    profile: { ranking: number; reputation: number; avatar: string; realName: string };
    badges: { id: string; name: string; icon: string }[];
    solved: { all: number; easy: number; medium: number; hard: number };
    contest: { rating: number; globalRanking: number; attendedContests: number; topPercentage: number };
}

const LeetCodeSection: React.FC<{ username: string }> = ({ username }) => {
    const [stats, setStats] = useState<LeetCodeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!username) { setLoading(false); return; }
        const fetch = async () => {
            try {
                const res = await api.get(`/leetcode/profile/${username}`);
                setStats(res.data);
            } catch (e: any) {
                setError(e.response?.data?.message || "Failed to load LeetCode data");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [username]);

    if (!username) return null;
    if (loading) return (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading LeetCode stats...
        </div>
    );
    if (error) return <p className="text-red-400 text-sm">{error}</p>;
    if (!stats) return null;

    const total = 3000; // approx LeetCode total problems
    const easyTotal = 800, mediumTotal = 1600, hardTotal = 600;

    const Bar = ({ count, total, color }: { count: number; total: number; color: string }) => (
        <div className="flex-1 bg-gray-800 rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min((count / total) * 100, 100)}%`, backgroundColor: color }} />
        </div>
    );

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a href={`https://leetcode.com/${username}`} target="_blank" rel="noopener noreferrer"
                        className="text-yellow-400 text-sm hover:underline">@{stats.username} →</a>
                    {stats.profile.ranking > 0 && (
                        <span className="text-xs text-gray-500">Rank #{stats.profile.ranking.toLocaleString()}</span>
                    )}
                </div>
                {stats.contest.rating > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full">
                        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-yellow-400 text-xs font-bold">{stats.contest.rating} Rating</span>
                    </div>
                )}
            </div>

            {/* Solved Stats */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: "Total", count: stats.solved.all, color: "#a3e635", bg: "bg-green-400/10", border: "border-green-400/30", text: "text-green-400" },
                    { label: "Easy", count: stats.solved.easy, color: "#22d3ee", bg: "bg-cyan-400/10", border: "border-cyan-400/30", text: "text-cyan-400" },
                    { label: "Medium", count: stats.solved.medium, color: "#fb923c", bg: "bg-orange-400/10", border: "border-orange-400/30", text: "text-orange-400" },
                    { label: "Hard", count: stats.solved.hard, color: "#f87171", bg: "bg-red-400/10", border: "border-red-400/30", text: "text-red-400" },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-3 text-center`}>
                        <div className={`text-2xl font-black ${s.text}`}>{s.count}</div>
                        <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Progress Bars */}
            <div className="space-y-2.5">
                {[
                    { label: "Easy", count: stats.solved.easy, total: easyTotal, color: "#22d3ee" },
                    { label: "Medium", count: stats.solved.medium, total: mediumTotal, color: "#fb923c" },
                    { label: "Hard", count: stats.solved.hard, total: hardTotal, color: "#f87171" },
                ].map(b => (
                    <div key={b.label} className="flex items-center gap-3">
                        <span className="text-gray-400 text-xs w-12">{b.label}</span>
                        <Bar count={b.count} total={b.total} color={b.color} />
                        <span className="text-gray-500 text-xs w-16 text-right">{b.count}/{b.total}</span>
                    </div>
                ))}
            </div>

            {/* Contest Stats */}
            {stats.contest.attendedContests > 0 && (
                <div className="grid grid-cols-3 gap-3 pt-1">
                    {[
                        { label: "Contests", value: stats.contest.attendedContests, icon: Target },
                        { label: "Global Rank", value: stats.contest.globalRanking > 0 ? `#${stats.contest.globalRanking.toLocaleString()}` : "N/A", icon: Trophy },
                        { label: "Top %", value: stats.contest.topPercentage > 0 ? `${stats.contest.topPercentage.toFixed(1)}%` : "N/A", icon: Award },
                    ].map(c => (
                        <div key={c.label} className="bg-gray-800/40 rounded-xl p-3 text-center border border-gray-700/40">
                            <c.icon className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                            <div className="text-white font-bold text-sm">{c.value}</div>
                            <div className="text-gray-500 text-xs">{c.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Badges */}
            {stats.badges.length > 0 && (
                <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Badges</p>
                    <div className="flex flex-wrap gap-2">
                        {stats.badges.slice(0, 12).map((badge, i) => (
                            <div key={i} title={badge.name}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full">
                                {badge.icon && (
                                    <img src={badge.icon} alt={badge.name} className="w-4 h-4 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                )}
                                <span className="text-yellow-400 text-xs font-medium">{badge.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeetCodeSection;
