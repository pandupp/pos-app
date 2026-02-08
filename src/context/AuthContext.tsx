import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types/api";

type StoreType = 'printing' | 'retail' | 'general';

interface AuthContextType {
  user: User | null;
  storeType: StoreType;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [storeType, setStoreType] = useState<StoreType>('general');
  const [isReady, setIsReady] = useState(false); 
  // Helper untuk menentukan tipe toko
  const determineStoreType = (email: string) => {
    if (email.includes('digital')) setStoreType('printing');
    else if (email.includes('seragam')) setStoreType('retail');
    else setStoreType('general');
  };

  useEffect(() => {
    // --- SAFE LOAD LOCAL STORAGE ---
    try {
      const savedUser = localStorage.getItem("pos_user");
      const savedToken = localStorage.getItem("pos_token");

      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        // Validasi sederhana
        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
          determineStoreType(parsedUser.email);
        } else {
          // Data korup? Hapus.
          localStorage.clear();
        }
      }
    } catch (error) {
      console.error("Gagal load session:", error);
      localStorage.clear(); // Reset jika error
    } finally {
      setIsReady(true);
    }
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem("pos_token", token);
    localStorage.setItem("pos_user", JSON.stringify(userData));
    setUser(userData);
    determineStoreType(userData.email);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setStoreType('general');
    window.location.href = '/login';
  };

  if (!isReady) return <div className="p-10 text-center">Loading App...</div>;

  return (
    <AuthContext.Provider value={{ user, storeType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};