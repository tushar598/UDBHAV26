import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  const handleSubmit = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      alert("Login successful!");
      window.location.href = "/resume-upload";
    } catch (err) {
      console.error("Login failed:", err);
      alert("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    handleSubmit(e); 
  }
};

  // ✅ OAuth handlers — redirect to backend OAuth endpoints
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/api/user/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'}/api/user/auth/github`;
  };

  return (
    <div className="relative min-h-screen bg-gray-950 overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s", transform: "translate(-50%, -50%)" }}
        ></div>

        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-green-400/30 rounded-full animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-400/30 rounded-full">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">
                  AI-Powered Platform
                </span>
              </div>

              <h1 className="text-6xl font-bold text-white leading-tight">
                Welcome Back
                <br />
                <span className="text-green-400">Career Hunter</span>
              </h1>

              <p className="text-xl text-gray-400">
                Login to access your personalized career dashboard and unlock
                AI-powered insights.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4 pt-8">
              {[
                "AI Resume Analysis",
                "Smart Job Matching",
                "Real-time Notifications",
                "Career Growth Tracking",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-green-400/10 border border-green-400/30 flex items-center justify-center group-hover:bg-green-400/20 transition-all duration-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-gray-300 text-lg">{feature}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">50K+</div>
                <div className="text-sm text-gray-500">Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">15K+</div>
                <div className="text-sm text-gray-500">Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">98%</div>
                <div className="text-sm text-gray-500">Success</div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="relative">
            {/* Glow Effect Behind Form */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-3xl blur-2xl"></div>

            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-3">Sign In</h2>
                <p className="text-gray-400">
                  Enter your credentials to continue
                </p>
              </div>

              <div className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sm text-green-400 hover:text-green-300 transition-colors"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-500 hover:text-gray-300 transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-500 hover:text-gray-300 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-green-400 focus:ring-green-400/50 focus:ring-2"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-400"
                  >
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || loading}
                  className="group relative w-full py-4 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-gray-900 font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-400/50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading || loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
                        Logging in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gray-900/80 text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social Login - Now functional */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="py-3 px-4 bg-gray-800/50 border border-gray-700 hover:border-green-400/50 hover:bg-gray-800 rounded-xl text-gray-300 font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={handleGithubLogin}
                    className="py-3 px-4 bg-gray-800/50 border border-gray-700 hover:border-green-400/50 hover:bg-gray-800 rounded-xl text-gray-300 font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-gray-400 mt-8">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                >
                  Sign up for free
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
