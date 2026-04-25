import React, { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  preferences?: {
    platforms: string[];
    genres: string[];
    onboardingCompleted: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, name?: string, isSignUp?: boolean) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
  updateProfile: (data: { name?: string; email?: string; password?: string; avatar_url?: string; preferences?: User['preferences'] }) => Promise<{ error: string | null }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('moodflix_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string, name?: string, isSignUp?: boolean): Promise<{ error: string | null }> => {
    const newUser = { 
      id: Math.random().toString(36).substr(2, 9), 
      name: name || email.split('@')[0], 
      email,
      preferences: { platforms: [], genres: [], onboardingCompleted: false }
    };
    localStorage.setItem('moodflix_user', JSON.stringify(newUser));
    setUser(newUser);
    return { error: null };
  };

  const updateProfile = async (data: { name?: string; email?: string; password?: string; avatar_url?: string; preferences?: User['preferences'] }): Promise<{ error: string | null }> => {
    if (user) {
      const updatedUser = { ...user, ...data };
      localStorage.setItem('moodflix_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    return { error: null };
  };

  const logout = async () => {
    localStorage.removeItem('moodflix_user');
    setUser(null);
  };

  const deleteAccount = async (): Promise<{ error: string | null }> => {
    localStorage.removeItem('moodflix_user');
    setUser(null);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, deleteAccount, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

