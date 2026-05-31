"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { authApi } from "@/lib/api";
import { USER_ROLES } from "@/lib/constants";

interface User {
  id: string;
  email: string;
  name: string;
  role: keyof typeof USER_ROLES;
  emailVerified: boolean;
  isActive: boolean;
  nickname?: {
    id: string;
    handle: string;
    avatarUrl?: string;
  };
  image?: string | null;
  consultant?: {
    id: string;
    verificationStatus: string;
    professionalTitle: string;
    hourlyRate: number;
    averageRating?: number | null;
    totalSessions?: number;
  } | null;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const persistAuth = (token: string, refreshToken: string, sessionToken: string | null) => {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);

  if (sessionToken) {
    localStorage.setItem("sessionToken", sessionToken);
  } else {
    localStorage.removeItem("sessionToken");
  }
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("sessionToken");
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const sessionToken = localStorage.getItem("sessionToken");

      if (!token || !sessionToken) {
        clearAuth();
        setIsLoading(false);
        return;
      }

      const response = await authApi.getMe();
      setUser(response.data.data);
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        console.error("Auth check failed:", error);
      }
      clearAuth();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authApi.login({ email, password });
    const { user: nextUser, token, refreshToken, sessionToken } = response.data.data;

    persistAuth(token, refreshToken, sessionToken);
    setUser(nextUser);
  };

  const register = async (data: RegisterData): Promise<void> => {
    const response = await authApi.register(data);
    const { user: nextUser, token, refreshToken, sessionToken } = response.data.data;

    persistAuth(token, refreshToken, sessionToken);
    setUser(nextUser);
  };

  const logout = async () => {
    try {
      const sessionToken = localStorage.getItem("sessionToken");

      if (sessionToken) {
        await authApi.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.data.data);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      clearAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export function useIsConsultant() {
  const { user } = useAuth();
  return user?.role === USER_ROLES.CONSULTANT || Boolean(user?.consultant);
}

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPER_ADMIN;
}

export function useIsSuperAdmin() {
  const { user } = useAuth();
  return user?.role === USER_ROLES.SUPER_ADMIN;
}

export function useIsVerifiedConsultant() {
  const { user } = useAuth();
  return Boolean(user?.consultant?.verificationStatus === "VERIFIED");
}