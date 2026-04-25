import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import {
  User,
  MapPin,
  Briefcase,
  Code,
  Github,
  Star,
  GitFork,
  Shield,
  Calendar,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Zap,
} from "lucide-react";

interface GithubRepo {
  name: string;
  fullName: string;
  description: string;
  url: string;
  language: string;
  techStack?: string[];
  frameworks?: string[];
  stars: number;
  forks: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();

  const [githubUsername, setGithubUsername] = useState("");
  const [availableRepos, setAvailableRepos] = useState<GithubRepo[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<GithubRepo[]>([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [connectingGithub, setConnectingGithub] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    skillLevel: string;
    analysis: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user?.githubUsername) {
      setGithubConnected(true);
      setGithubUsername(user.githubUsername);
    }
    if (user?.skillLevel) {
      setAnalysisResult({
        skillLevel: user.skillLevel,
        analysis: user.skillLevelAnalysis || "",
      });
    }
  }, [user]);

  const hasResumeParsed = user?.skills && user.skills.length > 0;

  const handleConnectGithub = async () => {
    if (!githubUsername.trim()) {
      setErrorMsg("Please enter your GitHub username");
      return;
    }
    try {
      setConnectingGithub(true);
      setErrorMsg("");
      await api.post("/github/connect", { githubUsername: githubUsername.trim() });
      setGithubConnected(true);
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to connect GitHub");
    } finally {
      setConnectingGithub(false);
    }
  };

  const handleFetchRepos = async () => {
    try {
      setFetchingRepos(true);
      setErrorMsg("");
      const res = await api.get("/github/repos");
      setAvailableRepos(res.data.repos || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to fetch repos");
    } finally {
      setFetchingRepos(false);
    }
  };

  const toggleRepoSelection = (repo: GithubRepo) => {
    const isSelected = selectedRepos.some((r) => r.name === repo.name);
    if (isSelected) {
      setSelectedRepos(selectedRepos.filter((r) => r.name !== repo.name));
    } else if (selectedRepos.length < 5) {
      setSelectedRepos([...selectedRepos, repo]);
    }
  };

  const handleAnalyze = async () => {
    if (selectedRepos.length === 0) {
      setErrorMsg("Please select at least 1 repo");
      return;
    }
    try {
      setAnalyzing(true);
      setErrorMsg("");
      const res = await api.post("/github/analyze", { selectedRepos });
      setAnalysisResult({
        skillLevel: res.data.skillLevel,
        analysis: res.data.analysis,
      });
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  // Auto-select repos mentioned in resume skills
  useEffect(() => {
    if (availableRepos.length > 0 && user?.skills && selectedRepos.length === 0) {
      const skillsLower = user.skills.map((s) => s.toLowerCase());
      const matched = availableRepos.filter((repo) => {
        const repoNameLower = repo.name.toLowerCase();
        const repoLangLower = (repo.language || "").toLowerCase();
        const repoDescLower = (repo.description || "").toLowerCase();
        return skillsLower.some(
          (skill) =>
            repoNameLower.includes(skill) ||
            repoLangLower.includes(skill) ||
            repoDescLower.includes(skill)
        );
      });
      if (matched.length > 0) {
        setSelectedRepos(matched.slice(0, 5));
      }
    }
  }, [availableRepos, user?.skills]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a0a0a]">
        <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-gray-400">
        <p className="text-xl mb-4">Please login to view your profile</p>
        <button onClick={() => navigate("/login")} className="px-6 py-3 bg-green-400 text-black font-bold rounded-full">
          Go to Login
        </button>
      </div>
    );
  }

  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const skillLevelColors: Record<string, string> = {
    beginner: "from-yellow-400 to-orange-500",
    intermediate: "from-blue-400 to-cyan-500",
    advanced: "from-green-400 to-emerald-500",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-400/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
        {/* Hero Profile Section */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl p-6 sm:p-10 border border-gray-800/50 shadow-2xl mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            {/* Avatar */}
            <div className="relative">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-green-400/50 shadow-xl shadow-green-400/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-4xl sm:text-5xl font-bold text-black border-4 border-green-400/50 shadow-xl">
                  {initials}
                </div>
              )}
              {user.authProvider && user.authProvider !== "local" && (
                <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1.5 border-2 border-green-400/50">
                  {user.authProvider === "google" ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  ) : (
                    <Github className="w-5 h-5 text-white" />
                  )}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">{user.name}</h1>
              <p className="text-gray-400 text-base sm:text-lg mb-3">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {user.authProvider && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-full border border-gray-700">
                    <Shield className="w-3 h-3" />
                    {user.authProvider === "local" ? "Email Login" : `${user.authProvider.charAt(0).toUpperCase() + user.authProvider.slice(1)} Login`}
                  </span>
                )}
                {user.location && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-full border border-gray-700">
                    <MapPin className="w-3 h-3" /> {user.location}
                  </span>
                )}
                {user.createdAt && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 text-gray-300 text-xs font-medium rounded-full border border-gray-700">
                    <Calendar className="w-3 h-3" /> Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                )}
              </div>

              {/* Skill Level Badge */}
              {analysisResult?.skillLevel && (
                <div className="mt-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${skillLevelColors[analysisResult.skillLevel] || "from-gray-400 to-gray-500"} text-black text-sm font-bold rounded-full shadow-lg`}>
                    <Zap className="w-4 h-4" />
                    {analysisResult.skillLevel.charAt(0).toUpperCase() + analysisResult.skillLevel.slice(1)} Developer
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        {user.skills && user.skills.length > 0 && (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl p-6 sm:p-8 border border-gray-800/50 shadow-2xl mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 flex items-center gap-3">
              <Code className="w-6 h-6 text-green-400" /> Skills
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {user.skills.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-green-400/10 text-green-400 text-sm font-semibold rounded-full border border-green-400/30 hover:bg-green-400/20 transition-all duration-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Career Goals Section */}
        {((user.desiredPost && user.desiredPost.length > 0) || (user.desiredLocation && user.desiredLocation.length > 0)) && (
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {user.desiredPost && user.desiredPost.length > 0 && (
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl p-6 sm:p-8 border border-gray-800/50 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-green-400" /> Desired Roles
                </h2>
                <div className="space-y-2">
                  {user.desiredPost.map((post, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 rounded-xl border border-gray-700/50">
                      <ArrowRight className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{post}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {user.desiredLocation && user.desiredLocation.length > 0 && (
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl p-6 sm:p-8 border border-gray-800/50 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-400" /> Target Locations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {user.desiredLocation.map((loc, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-800/50 text-gray-300 text-sm rounded-full border border-gray-700/50">
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Analysis Result */}
        {analysisResult?.analysis && (
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl p-6 sm:p-8 border border-gray-800/50 shadow-2xl mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Zap className="w-6 h-6 text-green-400" /> AI Skill Assessment
            </h2>
            <div className="bg-gray-800/30 rounded-2xl p-5 border border-gray-700/50">
              <p className="text-gray-300 leading-relaxed">{analysisResult.analysis}</p>
            </div>
          </div>
        )}

        {/* GitHub Repos Section */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-3xl p-6 sm:p-8 border border-gray-800/50 shadow-2xl mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <Github className="w-6 h-6 text-green-400" /> GitHub Projects
          </h2>

          {!hasResumeParsed ? (
            <div className="mt-4 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-5 text-center">
              <p className="text-yellow-400 font-semibold mb-2">⚠️ Resume Not Parsed Yet</p>
              <p className="text-gray-400 text-sm mb-4">Upload and parse your resume first to unlock GitHub project analysis.</p>
              <button onClick={() => navigate("/resume-upload")} className="px-6 py-2.5 bg-green-400 text-black font-bold rounded-full text-sm hover:scale-105 transition-transform">
                Upload Resume
              </button>
            </div>
          ) : (
            <>
              {/* GitHub Connect Section */}
              {!githubConnected && user.authProvider !== "github" && (
                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-4">Connect your GitHub to analyze your repositories and determine your skill level.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="Enter your GitHub username"
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
                    />
                    <button
                      onClick={handleConnectGithub}
                      disabled={connectingGithub}
                      className="px-6 py-3 bg-gray-800 border border-gray-700 hover:border-green-400/50 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {connectingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                      Connect GitHub
                    </button>
                  </div>
                </div>
              )}

              {/* Fetch & Select Repos */}
              {(githubConnected || user.authProvider === "github") && (
                <div className="mt-4">
                  {availableRepos.length === 0 ? (
                    <button
                      onClick={handleFetchRepos}
                      disabled={fetchingRepos}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 hover:border-green-400/50 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {fetchingRepos ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                      {fetchingRepos ? "Fetching Repos..." : "Fetch My Repositories"}
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-400 text-sm">
                          Select <span className="text-green-400 font-bold">1-5</span> repos for analysis ({selectedRepos.length}/5 selected)
                        </p>
                        <button
                          onClick={handleAnalyze}
                          disabled={analyzing || selectedRepos.length === 0}
                          className="px-5 py-2.5 bg-green-400 text-black font-bold rounded-full text-sm hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                          {analyzing ? "Analyzing..." : "Analyze with AI"}
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                        {availableRepos.map((repo) => {
                          const isSelected = selectedRepos.some((r) => r.name === repo.name);
                          return (
                            <button
                              key={repo.name}
                              onClick={() => toggleRepoSelection(repo)}
                              disabled={!isSelected && selectedRepos.length >= 5}
                              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                                isSelected
                                  ? "border-green-400/70 bg-green-400/10"
                                  : "border-gray-700/50 bg-gray-800/30 hover:border-gray-600"
                              } ${!isSelected && selectedRepos.length >= 5 ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              <div className="flex items-start justify-between mb-1.5">
                                <span className="text-white font-semibold text-sm truncate flex-1">{repo.name}</span>
                                {isSelected ? (
                                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 ml-2" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0 ml-2" />
                                )}
                              </div>
                              {repo.description && (
                                <p className="text-gray-400 text-xs line-clamp-2 mb-2">{repo.description}</p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {repo.language && (
                                  <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                    {repo.language}
                                  </span>
                                )}
                                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars}</span>
                                <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* Saved Repos Display */}
          {user.githubRepos && user.githubRepos.length > 0 && availableRepos.length === 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Analyzed Repositories</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {user.githubRepos.map((repo, i) => (
                  <a key={i} href={repo.url} target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-green-400/30 transition-all group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold text-sm">{repo.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-green-400 transition-colors" />
                    </div>
                    {repo.techStack && repo.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {repo.techStack.map((tech, j) => (
                          <span key={j} className="px-2 py-0.5 bg-green-400/10 text-green-400 text-[10px] font-medium rounded-full">{tech}</span>
                        ))}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-3 rounded-xl border border-red-400/30 text-sm">
              <XCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => navigate("/resume-upload")} className="px-6 py-3 bg-green-400 text-black font-bold rounded-full hover:scale-105 transition-transform">
            Resume Dashboard
          </button>
          <button onClick={() => navigate("/jobs")} className="px-6 py-3 border-2 border-green-400 text-green-400 font-bold rounded-full hover:bg-green-400 hover:text-black transition-all">
            Browse Jobs →
          </button>
        </div>
      </div>

      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default ProfilePage;
