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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/profile", {
        withCredentials: true,
      });

      setUser({
        _id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        profilePhoto: res.data.profilePhoto || "",
        authProvider: res.data.authProvider || "local",
        location: res.data.location || "",
        skills: res.data.skills || [],
        desiredPost: res.data.desiredPost || [],
        desiredLocation: res.data.desiredLocation || [],
        githubUsername: res.data.githubUsername || "",
        githubRepos: res.data.githubRepos || [],
        skillLevel: res.data.skillLevel || "",
        skillLevelAnalysis: res.data.skillLevelAnalysis || "",
        createdAt: res.data.createdAt || "",
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
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
    // Re-fetch full profile data
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
