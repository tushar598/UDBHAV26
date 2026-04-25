// import React, { useState } from "react";
// import { useAuth } from "../hooks/useAuth";
// const RegisterPage: React.FC = () => {
//   const { register, loading } = useAuth();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!name || !email || !password || !confirmPassword) {
//       alert("Please fill in all fields.");
//       return;
//     }

//     if (password !== confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }

//     try {
//       await register(name, email, password);
//       alert("Registration successful!");
//     } catch (err) {
//       console.error("Registration failed:", err);
//       alert("Registration failed. Please try again.");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
//         <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
//           Create Account
//         </h2>

//         <form onSubmit={handleRegister} className="space-y-4">
//           {/* Name Field */}
//           <div>
//             <label
//               htmlFor="name"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Full Name
//             </label>
//             <input
//               id="name"
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Enter your name"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Email Field */}
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Password Field */}
//           <div>
//             <label
//               htmlFor="password"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Confirm Password Field */}
//           <div>
//             <label
//               htmlFor="confirmPassword"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
//               Confirm Password
//             </label>
//             <input
//               id="confirmPassword"
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               placeholder="Confirm your password"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2 mt-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
//           >
//             {loading ? "Logging in..." : "Register"}
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-500 mt-4">
//           Already have an account?{" "}
//           <a href="/login" className="text-blue-600 hover:underline">
//             Login
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;

import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const RegisterPage: React.FC = () => {
  const { register, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  useEffect(() => {
    // Floating particles animation setup
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await register(name, email, password);
      alert("Registration successful!");
      window.location.href = "/login";
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Registration failed. Please try again.");
    }
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

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Main Register Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Branding Section */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-400/10 border border-green-400/30 rounded-full">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">
                  AI-Powered Career Assistant
                </span>
              </div>

              <h1 className="text-6xl font-bold text-white leading-tight">
                Join the
                <br />
                <span className="text-green-400">Career Revolution</span>
              </h1>

              <p className="text-xl text-gray-400">
                Create an account to unlock personalized job insights and
                intelligent career growth tools.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-8">
              {[
                "AI Resume Builder",
                "Smart Career Recommendations",
                "Live Job Alerts",
                "Progress Dashboard",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-lg bg-green-400/10 border border-green-400/30 flex items-center justify-center group-hover:bg-green-400/20 transition-all duration-300">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-gray-300 text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Form Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-3xl blur-2xl"></div>

            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-3">
                  Create Account
                </h2>
                <p className="text-gray-400">
                  Join us and take your career to the next level
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
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
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-green-400 transition-colors" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full py-4 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-gray-900 font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-400/50 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        Sign Up
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </form>

              {/* Link to Login */}
              <p className="text-center text-gray-400 mt-8">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Animation and Grid Pattern */}
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

export default RegisterPage;
