import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'OPERATOR' | 'DRIVER';
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Restore session from stored token
    const token = localStorage.getItem('uyir_token');
    const storedUser = localStorage.getItem('uyir_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('uyir_token');
        localStorage.removeItem('uyir_user');
      }
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Sign in failed' }));
      throw new Error(body.error || 'Sign in failed');
    }

    const { token, user: userData } = await res.json();
    setUser(userData);
    localStorage.setItem('uyir_token', token);
    localStorage.setItem('uyir_user', JSON.stringify(userData));
  };

  const signUp = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Sign up failed' }));
      throw new Error(body.error || 'Sign up failed');
    }

    const { token, user: userData } = await res.json();
    setUser(userData);
    localStorage.setItem('uyir_token', token);
    localStorage.setItem('uyir_user', JSON.stringify(userData));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('uyir_token');
    localStorage.removeItem('uyir_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
