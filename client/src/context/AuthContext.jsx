/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check Token
  useEffect(() => {
    const checkAuth = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token atau data user tidak valid", error);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username, password, rememberMe = false) => {
    const response = await api.post("/auth/login", { username, password });
    const { token, data } = response.data;

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(data));

    setUser(data);
    setIsAuthenticated(true);

    return response.data;
  };

  const updateLocalUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);

    if (localStorage.getItem("user")) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else if (sessionStorage.getItem("user")) {
      sessionStorage.setItem("user", JSON.stringify(newUser));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, updateLocalUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
