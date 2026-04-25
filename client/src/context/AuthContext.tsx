import React, { createContext, useState, useEffect, ReactNode } from "react";
import { userLogin } from "../services/auth/login";
import { userSignin } from "../services/auth/signin";
import { userLogout } from "../services/auth/logout";
import api from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePhoto?: string;
  authProvider?: string;
  role?: string;
  location?: string;
  skills?: string[];
  desiredPost?: string[];
  desiredLocation?: string[];
  githubUsername?: string;
  githubRepos?: Array<{
    name: string;
    fullName: string;
    description: string;
    url: string;
    language: string;
    techStack: string[];
    frameworks: string[];
    stars: number;
    forks: number;
  }>;
  leetcodeUsername?: string;
  skillLevel?: string;
  skillLevelAnalysis?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  companyLogin: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      // ✅ FIXED: Call /user/me first to determine role from JWT (zero DB calls)
      // This eliminates the fragile try/catch fallback chain that caused company
      // users to sometimes be loaded as regular users on page refresh.
      const meRes = await api.get("/user/me", { withCredentials: true });
      const { id, role } = meRes.data;

      if (role === "company") {
        // ✅ Fetch company profile
        const companyRes = await api.get("/company/profile", {
          withCredentials: true,
        });
        setUser({
          _id: companyRes.data.id,
          name: companyRes.data.companyName,
          email: companyRes.data.email,
          profilePhoto: companyRes.data.logo || "",
          role: "company",
          location: companyRes.data.location || "",
          createdAt: companyRes.data.createdAt || "",
        });
      } else {
        // ✅ Fetch user profile
        const userRes = await api.get("/user/profile", {
          withCredentials: true,
        });
        setUser({
          _id: userRes.data.id,
          name: userRes.data.name,
          email: userRes.data.email,
          profilePhoto: userRes.data.profilePhoto || "",
          authProvider: userRes.data.authProvider || "local",
          role: userRes.data.role || "user",
          location: userRes.data.location || "",
          skills: userRes.data.skills || [],
          desiredPost: userRes.data.desiredPost || [],
          desiredLocation: userRes.data.desiredLocation || [],
          githubUsername: userRes.data.githubUsername || "",
          githubRepos: userRes.data.githubRepos || [],
          leetcodeUsername: userRes.data.leetcodeUsername || "",
          skillLevel: userRes.data.skillLevel || "",
          skillLevelAnalysis: userRes.data.skillLevelAnalysis || "",
          createdAt: userRes.data.createdAt || "",
        });
      }
    } catch {
      // No valid token or expired token → unauthenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Login Function
  const login = async (email: string, password: string) => {
    const res = await userLogin(email, password);
    setUser({ _id: res.userId, name: res.name, email });
    await fetchUser();
  };

  // ✅ Register Function
  const register = async (name: string, email: string, password: string) => {
    await userSignin(name, email, password);
    await login(email, password);
  };

  // ✅ Logout Function
  const logout = async () => {
    await userLogout();
    setUser(null);
  };

  // ✅ Company Login
  const companyLogin = async (email: string, password: string) => {
    await api.post("/company/login", { email, password });
    // fetchUser will now correctly identify role="company" via /user/me
    await fetchUser();
  };

  // ✅ Refresh user data (for after GitHub analysis etc.)
  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        companyLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
