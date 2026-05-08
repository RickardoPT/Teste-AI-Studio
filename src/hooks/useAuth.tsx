import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

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
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: data?.name || authUser.email?.split('@')[0] || 'Utilizador',
        avatar_url: data?.avatar_url,
        preferences: {
          platforms: Array.isArray(data?.preferred_platforms) ? data.preferred_platforms : [],
          genres: Array.isArray(data?.preferred_genres) ? data.preferred_genres : [],
          onboardingCompleted:
            (Array.isArray(data?.preferred_platforms) && data.preferred_platforms.length > 0) ||
            (Array.isArray(data?.preferred_genres) && data.preferred_genres.length > 0)
        }
      });
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string, name?: string, isSignUp?: boolean): Promise<{ error: string | null }> => {
    try {
      if (!password) {
        return { error: 'A password é obrigatória para login/registo.' };
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        // The trigger in SQL will create the profile automatically
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const updateProfile = async (data: { name?: string; email?: string; password?: string; avatar_url?: string; preferences?: User['preferences'] }): Promise<{ error: string | null }> => {
    if (!user) return { error: 'No user to update' };
    
    try {
      // 1. Atualizar Profile
      const updates: any = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.avatar_url !== undefined) updates.avatar_url = data.avatar_url;
      if (data.preferences) {
        updates.preferred_platforms = data.preferences.platforms;
        updates.preferred_genres = data.preferences.genres;
      }

      if (Object.keys(updates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
          
        if (profileError) throw profileError;
      }

      // 2. Atualizar Auth (Email/Pass)
      if (data.email || data.password) {
        const authUpdates: any = {};
        if (data.email) authUpdates.email = data.email;
        if (data.password) authUpdates.password = data.password;
        
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) throw authError;
      }

      // Refresh local user state
      await fetchUserProfile({ id: user.id, email: data.email || user.email });

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const deleteAccount = async (): Promise<{ error: string | null }> => {
    // Calling an RPC function would be cleaner, but user can delete from client via Edge Function
    // For now we will just log them out if auth.admin is not available on client
    // Note: Deleting a user requires service_role key typically.
    // For local dev, we will just sign out.
    logout();
    return { error: 'O apagamento total da conta necessita de configuração adicional (Edge Function).' };
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

