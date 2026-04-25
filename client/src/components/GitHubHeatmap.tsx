import React, { useEffect, useState } from "react";
import api from "../services/api";

interface ContributionDay {
    date: string;
    contributionCount: number;
    color: string;
}
interface Week {
    contributionDays: ContributionDay[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface GitHubHeatmapProps {
    githubUsername: string;
    /** When true, fetches the developer's public contributions instead of the logged-in user's */
    publicMode?: boolean;
}

const GitHubHeatmap: React.FC<GitHubHeatmapProps> = ({ githubUsername, publicMode = false }) => {
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchContributions = async () => {
            setLoading(true);
            setError("");
            try {
                // ✅ FIXED: publicMode uses the username-based endpoint so companies
                // see the developer's data, not their own contributions
                const endpoint = publicMode
                    ? `/github/contributions/public/${githubUsername}`
                    : `/github/contributions`;

                const res = await api.get(endpoint);
                setWeeks(res.data.weeks || []);
                setTotal(res.data.totalContributions || 0);
            } catch {
                setError("Could not load contribution data.");
            } finally {
                setLoading(false);
            }
        };

        if (githubUsername) fetchContributions();
    }, [githubUsername, publicMode]);

    const getColor = (count: number) => {
        if (count === 0) return "#1a1a2e";
        if (count <= 3) return "#0e4429";
        if (count <= 6) return "#006d32";
        if (count <= 9) return "#26a641";
        return "#39d353";
    };

    // Build month labels
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
        const day = week.contributionDays[0];
        if (day) {
            const m = new Date(day.date).getMonth();
            if (m !== lastMonth) { monthLabels.push({ label: MONTHS[m], col: i }); lastMonth = m; }
        }
    });

    if (loading) return (
        <div className="flex items-center justify-center h-24">
            <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return <p className="text-red-400 text-sm">{error}</p>;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">{total} contributions in the last year</span>
                <a href={`https://github.com/${githubUsername}`} target="_blank" rel="noopener noreferrer"
                    className="text-green-400 text-xs hover:underline">View on GitHub →</a>
            </div>
            <div className="overflow-x-auto">
                <div style={{ position: "relative", paddingTop: "20px" }}>
                    {/* Month labels */}
                    <div style={{ display: "flex", position: "absolute", top: 0, left: 0, gap: 0 }}>
                        {monthLabels.map((m, i) => (
                            <span key={i} style={{ position: "absolute", left: m.col * 13, fontSize: 10, color: "#6b7280", whiteSpace: "nowrap" }}>
                                {m.label}
                            </span>
                        ))}
                    </div>
                    {/* Grid */}
                    <div style={{ display: "flex", gap: 2 }}>
                        {weeks.map((week, wi) => (
                            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {week.contributionDays.map((day, di) => (
                                    <div key={di}
                                        style={{ width: 11, height: 11, borderRadius: 2, backgroundColor: getColor(day.contributionCount), cursor: "pointer", flexShrink: 0 }}
                                        onMouseEnter={e => {
                                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                                            setTooltip({ text: `${day.contributionCount} contributions on ${day.date}`, x: rect.left, y: rect.top });
                                        }}
                                        onMouseLeave={() => setTooltip(null)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {tooltip && (
                <div style={{ position: "fixed", top: tooltip.y - 36, left: tooltip.x, zIndex: 50, pointerEvents: "none" }}
                    className="bg-gray-900 border border-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {tooltip.text}
                </div>
            )}
            <div className="flex items-center gap-2 mt-2 justify-end">
                <span className="text-gray-500 text-xs">Less</span>
                {["#1a1a2e", "#0e4429", "#006d32", "#26a641", "#39d353"].map((c, i) => (
                    <div key={i} style={{ width: 11, height: 11, borderRadius: 2, backgroundColor: c }} />
                ))}
                <span className="text-gray-500 text-xs">More</span>
            </div>
        </div>
    );
};

export default GitHubHeatmap;
