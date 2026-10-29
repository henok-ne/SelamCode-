"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { SessionUser } from "@/lib/types";
const AuthContext = createContext<{ user: SessionUser | null; setUser: (user: SessionUser | null) => void; demoEnabled: boolean }>({ user: null, setUser: () => {}, demoEnabled: false });
export function AuthProvider({ children, initialUser, demoEnabled }: { children: ReactNode; initialUser: SessionUser | null; demoEnabled: boolean }) {
  const [user, setUser] = useState(initialUser);
  return <AuthContext.Provider value={{ user, setUser, demoEnabled }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
