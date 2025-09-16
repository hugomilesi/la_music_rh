import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { debugAuth, debugRender } from '@/utils/debugUtils';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  level?: string;
  permissions?: string[];
  metadata?: any;
  nome?: string;
  nivel?: string;
  cargo?: string;
  departamento?: string;
  phone?: string;
  department?: string;
  position?: string;
  bio?: string;
  birth_date?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  start_date?: string;
  status?: string;
  preferences?: any;
  employee_id?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  forceLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Auth context logging disabled
  
  return context;
};

// Utility function to clear all auth-related storage
const clearAllAuthStorage = () => {
  // Storage clearing logging disabled
  try {
    // Clear Supabase-specific keys
    const keysToRemove = [
      'supabase.auth.token',
      'sb-dzmatfnltgtgjvbputtb-auth-token',
      'sb-auth-token'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Clear any remaining auth-related keys
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if ((key.includes('supabase') || key.includes('auth')) && key !== 'userProfile') {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
      // Error clearing storage
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  debugRender('AuthProvider');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const fetchProfile = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      return;
    }

    try {
      // Buscar perfil diretamente da tabela users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', targetUserId)
        .single();

      if (error) {
        return;
      }

      if (data) {
        setProfile(data as Profile);
        // Salvar no sessionStorage
        sessionStorage.setItem('userProfile', JSON.stringify(data));
      }
      
    } catch (error) {
      setProfile(null);
      sessionStorage.removeItem('userProfile');
    }
  };

  const clearAuthState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const forceLogout = async () => {
    setIsSigningOut(true);
    
    try {
      // Clear state immediately
      clearAuthState();
      
      // Clear all storage
      clearAllAuthStorage();
      
      // Try to sign out from Supabase (but don't wait for it or handle errors)
      supabase.auth.signOut().catch(() => {
        // Silent fail
      });
      
      // Force redirect to home
      window.location.href = '/';
    } catch (error) {
      // Even if there's an error, force redirect
      window.location.href = '/';
    }
  };

  const handleSuccessfulLogout = () => {
    clearAuthState();
    clearAllAuthStorage();
    setIsSigningOut(false);
    
    // Force navigation to home page after logout
    setTimeout(() => {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }, 100);
  };

  // Function to load profile from sessionStorage (for temporary profiles)
  const loadProfileFromStorage = () => {
    try {
      const storedProfile = sessionStorage.getItem('userProfile');
      
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        setProfile(parsedProfile as Profile);
        return true;
      }
    } catch (error) {
      // Error loading from storage
    }
    return false;
  };

  useEffect(() => {
    // Check if we're on a public route that doesn't need authentication
    const isPublicRoute = () => {
      const path = window.location.pathname;
      return path === '/' || 
             path === '/auth' || 
             path.startsWith('/survey/') || 
             path.startsWith('/nps/') || 
             path === '*';
    };

    // Auth listener setup logging disabled
    
    // Set up auth state listener (always needed for login/logout events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Auth state change logging disabled
        
        if (event === 'SIGNED_OUT') {
          // User logout logging disabled
          if (isSigningOut) {
            handleSuccessfulLogout();
          } else {
            clearAuthState();
            clearAllAuthStorage();
          }
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(session.user);
          setLoading(false); // Importante: definir loading como false
          
          // Aguardar um pouco mais para evitar race conditions
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 100);
        }
        
        if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session);
          setUser(session.user);
          
          if (session.user && session.user.id !== user?.id) {
            setTimeout(() => {
              fetchProfile(session.user.id);
            }, 100);
          }
        }
        
        setLoading(false);
      }
    );

    // If on public route, skip session initialization but keep listener active
    if (isPublicRoute()) {
      setLoading(false);
    } else {
      // Check for existing session only on protected routes
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 100);
        } else {
          // If no session, try to load profile from sessionStorage (for temporary profiles)
          loadProfileFromStorage();
        }
        
        setLoading(false);
      }).catch((error) => {
        // Log desabilitado: AuthContext: Erro ao obter sessão inicial
        // Even if session fails, try to load profile from storage
        loadProfileFromStorage();
        setLoading(false);
      });
    }

    return () => subscription.unsubscribe();
  }, [isSigningOut]);

  // Listen for storage events to update profile when sessionStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (!user) {
        loadProfileFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profile-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profile-updated', handleStorageChange);
    };
  }, [user]);

  // Monitor profile changes and log when it's loaded
  useEffect(() => {
    if (profile && user) {
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('profile-loaded', {
        detail: { profile, user }
      }));
    }
  }, [profile, user]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { error };
    } catch (e) {
      return { error: new Error('Unexpected error during sign in') };
    }
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    return { error };
  };

  const signOut = async () => {
    if (isSigningOut) {
      return { error: null };
    }

    // Sign out function logging disabled
    setIsSigningOut(true);
    
    try {
      // Clear state and storage immediately
      clearAuthState();
      clearAllAuthStorage();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        // Supabase sign out error logging disabled
        
        // Handle session not found errors gracefully
        if (error.message?.includes('session_not_found') || 
            error.message?.includes('Session not found') ||
            error.message?.includes('Invalid session')) {
          // Log desabilitado: Session already invalid, treating as successful logout
          handleSuccessfulLogout();
          return { error: null };
        }
        
        // For other errors, still try to logout locally
        // Log desabilitado: Supabase signOut failed, but continuing with local logout
        handleSuccessfulLogout();
        return { error: null };
      }
      
      // Successful sign out logging disabled
      handleSuccessfulLogout();
      return { error: null };
      
    } catch (error) {
      // Unexpected sign out error logging disabled
      // Even if there's an error, force local logout
      handleSuccessfulLogout();
      return { error: null };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    // Update profile function logging disabled
    
    if (!user) {
      // User not logged in logging disabled
      return { error: 'Usuário não está logado' };
    }

    try {
      // Profile update logging disabled
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) {
        // Log desabilitado: updateProfile: Error updating profile
        return { error: error.message };
      }


      
      // Atualizar o estado local imediatamente
      if (data) {
        // Profile update state logging disabled
        setProfile(data);

        // Profile new state logging disabled
      }
      
      // Buscar o perfil atualizado para garantir sincronização
      // Profile sync fetch logging disabled
      await fetchProfile(user.id);

      
      return { data };
    } catch (error) {
      // Log desabilitado: updateProfile: Unexpected error
      return { error: 'Erro inesperado ao atualizar perfil' };
    }
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    resendConfirmation,
    forceLogout
  };
  
  // Auth context value logging disabled

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
