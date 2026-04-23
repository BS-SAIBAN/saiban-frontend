'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';

interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'field_worker' | 'viewer';
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isFieldWorker: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (stored && token && stored !== 'undefined') {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const { access_token } = res.data;
    localStorage.setItem('access_token', access_token);
    
    // Fetch user data after successful login
    try {
      const userRes = await authAPI.me();
      const userData = userRes.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.error('Failed to fetch user data:', e);
      // Create minimal user from email for now
      const minimalUser = { user_id: '', full_name: email.split('@')[0], email, role: 'admin', active: true };
      localStorage.setItem('user', JSON.stringify(minimalUser));
      setUser(minimalUser as User);
    }
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout,
      isAdmin: user?.role === 'admin',
      isFieldWorker: user?.role === 'field_worker',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
