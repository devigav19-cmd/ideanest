import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for saved token
  useEffect(() => {
    const token = localStorage.getItem("ideanest_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      localStorage.removeItem("ideanest_token");
      delete api.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem("ideanest_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async ({ name, email, password, role }) => {
    const res = await api.post("/auth/register", { name, email, password, role });
    const { token, user: userData } = res.data;
    localStorage.setItem("ideanest_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ideanest_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
