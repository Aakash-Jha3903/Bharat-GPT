import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [access, setAccess] = useState(localStorage.getItem("access") || null);
  const [refresh, setRefresh] = useState(localStorage.getItem("refresh") || null);

  const login = async (username, password) => {
    const response = await axios.post("http://localhost:8000/api/token/", {
      username,
      password,
    });

    setAccess(response.data.access);
    setRefresh(response.data.refresh);

    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
  };

  const logout = () => {
    setAccess(null);
    setRefresh(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  };

  // Automatically refresh token every 4 minutes (before 5-minute expiry)
  useEffect(() => {
    if (!refresh) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.post("http://localhost:8000/api/token/refresh/", {
          refresh,
        });
        setAccess(res.data.access);
        localStorage.setItem("access", res.data.access);
      } catch (err) {
        console.error("Token refresh failed", err);
        logout();
      }
    }, 4 * 60 * 1000); // every 4 minutes

    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ token: access, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
