
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
  position?: string;
  bio?: string;
  status?: string;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; needsConfirmation?: boolean }>;
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

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data as Profile | null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
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

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    // Check if user needs email confirmation
    const needsConfirmation = data?.user && !data?.session;
    
    return { error, needsConfirmation };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
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
    if (!user) return { error: 'No user logged in' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
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
    signUp,
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
