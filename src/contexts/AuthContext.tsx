import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Check for stored session
    const storedUser = localStorage.getItem('uyir_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock authentication
    await new Promise((resolve) => setTimeout(resolve, 500));
    const mockUser: User = {
      id: '1',
      email,
      role: email.includes('operator') ? 'OPERATOR' : email.includes('driver') ? 'DRIVER' : 'USER',
      name: email.split('@')[0],
    };
    setUser(mockUser);
    localStorage.setItem('uyir_user', JSON.stringify(mockUser));
  };

  const signUp = async (email: string, password: string, name: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      role: 'USER',
      name,
    };
    setUser(mockUser);
    localStorage.setItem('uyir_user', JSON.stringify(mockUser));
  };

  const signOut = () => {
    setUser(null);
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
