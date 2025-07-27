import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  return context;
};

// Utility function to clear all auth-related storage
const clearAllAuthStorage = () => {
  console.log('Clearing all auth-related storage');
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
      if (key.includes('supabase') || key.includes('auth')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Error clearing storage:', error);
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const fetchProfile = async (userId?: string) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      console.log('🔍 fetchProfile: No user ID available');
      return;
    }

    console.log('🔍 fetchProfile: Fetching profile for user:', targetUserId);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', targetUserId)
      .single();

    if (error) {
      console.error('❌ fetchProfile: Error fetching profile:', error);
      return;
    }

    console.log('✅ fetchProfile: Profile fetched successfully:', data);
    console.log('🔄 fetchProfile: Setting profile in state...');
    setProfile(data as Profile);
    console.log('✅ fetchProfile: Profile state updated');
  };

  const clearAuthState = () => {
    console.log('Clearing auth state');
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const forceLogout = async () => {
    console.log('Force logout initiated');
    setIsSigningOut(true);
    
    try {
      // Clear state immediately
      clearAuthState();
      
      // Clear all storage
      clearAllAuthStorage();
      
      // Try to sign out from Supabase (but don't wait for it or handle errors)
      supabase.auth.signOut().catch(() => {
        console.log('Supabase signOut failed, but continuing with forced logout');
      });
      
      // Force redirect to home
      window.location.href = '/';
    } catch (error) {
      console.warn('Error during force logout, but continuing:', error);
      // Even if there's an error, force redirect
      window.location.href = '/';
    }
  };

  const handleSuccessfulLogout = () => {
    console.log('Handling successful logout - clearing state and redirecting');
    clearAuthState();
    clearAllAuthStorage();
    setIsSigningOut(false);
    
    // Force navigation to home page after logout
    setTimeout(() => {
      if (window.location.pathname !== '/') {
        console.log('Redirecting to home page after logout');
        window.location.href = '/';
      }
    }, 100);
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || (!session && !isSigningOut)) {
          console.log('User signed out or session lost');
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
          console.log('User signed in');
          setSession(session);
          setUser(session.user);
          
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      
      // Validate session is actually valid
      if (session) {
        // Check if session is expired
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < now) {
          console.log('Session expired, clearing it');
          clearAllAuthStorage();
          clearAuthState();
          setLoading(false);
          return;
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('Error getting initial session:', error);
      clearAllAuthStorage();
      clearAuthState();
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isSigningOut]);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Sign in error:', error.message);
      }
      
      return { error };
    } catch (e) {
      console.error('Unexpected error during sign in:', e);
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
      console.log('Sign out already in progress');
      return { error: null };
    }

    console.log('SignOut function called');
    setIsSigningOut(true);
    
    try {
      // Clear state and storage immediately
      clearAuthState();
      clearAllAuthStorage();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        
        // Handle session not found errors gracefully
        if (error.message?.includes('session_not_found') || 
            error.message?.includes('Session not found') ||
            error.message?.includes('Invalid session')) {
          console.log('Session already invalid, treating as successful logout');
          handleSuccessfulLogout();
          return { error: null };
        }
        
        // For other errors, still try to logout locally
        console.log('Supabase signOut failed, but continuing with local logout');
        handleSuccessfulLogout();
        return { error: null };
      }
      
      console.log('Supabase signOut successful');
      handleSuccessfulLogout();
      return { error: null };
      
    } catch (error) {
      console.error('Unexpected error during signOut:', error);
      // Even if there's an error, force local logout
      handleSuccessfulLogout();
      return { error: null };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    console.log('🔄 updateProfile: Called with updates:', updates);
    
    if (!user) {
      console.error('❌ updateProfile: No user logged in');
      return { error: 'Usuário não está logado' };
    }

    try {
      console.log('🔄 updateProfile: Updating profile for user ID:', user.id);
      console.log('🔄 updateProfile: Current profile state before update:', profile);
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ updateProfile: Error updating profile:', error);
        return { error: error.message };
      }

      console.log('✅ updateProfile: Profile updated successfully in database:', data);
      
      // Atualizar o estado local imediatamente
      if (data) {
        console.log('🔄 updateProfile: Setting updated profile in local state...');
        setProfile(data);
        console.log('✅ updateProfile: Profile state updated locally');
        console.log('🔄 updateProfile: New profile state:', data);
      }
      
      // Buscar o perfil atualizado para garantir sincronização
      console.log('🔄 updateProfile: Fetching profile to ensure sync...');
      await fetchProfile(user.id);
      console.log('✅ updateProfile: Profile sync completed');
      
      return { data };
    } catch (error) {
      console.error('❌ updateProfile: Unexpected error:', error);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
