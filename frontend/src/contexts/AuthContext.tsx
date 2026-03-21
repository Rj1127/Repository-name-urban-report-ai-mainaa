import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, otp?: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch (err) {
      console.error("Failed to parse user from local storage", err);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN
  const login = async (email: string, password: string, otp?: string) => {
    setLoading(true);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      throw new Error(data.message || "Login failed");
    }

    if (data.requireOtp) {
      setLoading(false);
      return data;
    }

    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));

    setLoading(false);
    return data;
  };

  // 📝 REGISTER
  const register = async (userData: any) => {
    setLoading(true);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      throw new Error(data.message || "Registration failed");
    }

    if (data.requireOtp) {
      setLoading(false);
      return data;
    }

    setLoading(false);
    return data;
  };

  // 🚪 LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Successfully logged out");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};