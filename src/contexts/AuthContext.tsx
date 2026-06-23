import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, userApi } from '../lib/api';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  isTwoFactorEnabled: boolean;
  savedJds: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  pendingToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requiresTwoFactor: boolean }>;
  verify2fa: (code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      userApi
        .me()
        .then(setUser)
        .catch(() => {
          setToken(null);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    if (data.requiresTwoFactor) {
      setPendingToken(data.accessToken);
      return { requiresTwoFactor: true };
    }
    localStorage.setItem('token', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return { requiresTwoFactor: false };
  };

  const verify2fa = async (code: string) => {
    if (!pendingToken) throw new Error('No pending token');
    localStorage.setItem('token', pendingToken);
    const data = await authApi.verify2fa(code);
    setPendingToken(null);
    localStorage.setItem('token', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPendingToken(null);
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    const data = await userApi.me();
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, token, pendingToken, loading, login, verify2fa, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
