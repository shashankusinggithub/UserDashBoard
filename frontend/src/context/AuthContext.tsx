// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import { ApolloClient } from "@apollo/client";
import { resetApolloCache } from "../utils/apollo-client";
import { useStores } from "../hooks/useStores";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
  client: ApolloClient<any>;
}

let globalLogout: () => void;

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  client,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const { chatWindowStore } = useStores();

  useEffect(() => {
    globalLogout = logout;
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUser(parsedUser);
      chatWindowStore.setCurrentUserId(parsedUser.id);
    }
  }, [chatWindowStore]);

  const login = (token: string, user: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setIsAuthenticated(true);
    setUser(user);
    chatWindowStore.setCurrentUserId(user.id);
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
      chatWindowStore.setCurrentUserId("");
      resetApolloCache();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const logout = () => {
  if (globalLogout) {
    globalLogout();
  }
};
