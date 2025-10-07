import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { debugAuth, debugRender } from '@/utils/debugUtils';
import { invalidatePermissionsCache } from '@/hooks/usePermissionsV2';

interface Profile {
  id: string;
  auth_user_id?: string;
  profile_id?: string;
  username?: string;
  email: string;
  role: string;
  permissions?: any;
  settings?: any;
  status?: string;
  employee_id?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  department?: string | null;
  position?: string | null;
  deleted_at?: string | null;
  last_login?: string | null;
  preferences?: any;
  employee_number?: string | null;
  birth_date?: string | null;
  cpf?: string | null;
  rg?: string | null;
  hire_date?: string | null;
  termination_date?: string | null;
  salary?: number | null;
  address?: any;
  emergency_contact?: any;
  documents?: any;
  notes?: string | null;
  unit_id?: string | null;
  system_permissions?: any;
  profile_data?: any;
  // Legacy fields for backward compatibility
  level?: string;
  metadata?: any;
  bio?: string;
  emergency_phone?: string;
  start_date?: string;
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
  forceRefreshProfile: () => Promise<void>;
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
      'sb-jrphwjkgepmgdgiqebyr-auth-token',
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
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 AuthContext: fetchProfile called for userId:', userId);
      
      // Force clear any cached data
      invalidatePermissionsCache(userId);
      
      console.log('🔍 AuthContext: Attempting to fetch profile with normal client...');
      
      // Primeiro, tentar com o cliente normal
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      console.log('🔍 AuthContext: Normal client result - data:', !!data, 'error:', error);

      // Se falhar devido a RLS, log do erro mas não criar nova instância
      if (error && error.code === 'PGRST116') {
        console.log('🔍 AuthContext: RLS blocking access, user may not have proper permissions');
        console.log('🔍 AuthContext: Error details:', error);
        
        // Não criar nova instância do cliente, apenas retornar null
        console.log('🔍 AuthContext: Skipping service role fallback to avoid multiple client instances')
      } else if (error) {
        console.error('❌ AuthContext: Error fetching profile:', error);
        throw error;
      }

      if (data) {
        console.log('✅ AuthContext: Profile fetched successfully:', data);
        console.log('🔍 AuthContext: Setting profile state...');
        setProfile(data as Profile);
        
        console.log('🔍 AuthContext: Storing in sessionStorage...');
        // Store in sessionStorage for persistence
        sessionStorage.setItem('userProfile', JSON.stringify(data));
        
        console.log('🔍 AuthContext: Dispatching profile-loaded event...');
        // Dispatch event to notify components
        window.dispatchEvent(new CustomEvent('profile-loaded', {
          detail: { profile: data, user: { id: userId } }
        }));
        
        console.log('✅ AuthContext: fetchProfile completed successfully');
      } else {
        console.log('⚠️ AuthContext: No data returned from query');
      }
    } catch (error) {
      console.error('❌ AuthContext: fetchProfile error:', error);
      setProfile(null);
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

  const forceRefreshProfile = async () => {
    if (!user?.id) {
      return;
    }
    
    try {
      console.log('🔍 AuthContext: forceRefreshProfile called');
      
      // Limpar completamente o cache mas manter o profile atual temporariamente
      sessionStorage.removeItem('userProfile');
      
      // Invalidar cache de permissões
      invalidatePermissionsCache(user.id);
      
      // Buscar dados frescos do banco SEM limpar o profile antes
      console.log('🔍 AuthContext: Fetching fresh profile without clearing current state...');
      await fetchProfile(user.id);
      
      console.log('✅ AuthContext: forceRefreshProfile completed');
    } catch (error) {
      console.error('❌ AuthContext: forceRefreshProfile error:', error);
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
    console.log('🔍 AuthContext: useEffect triggered - initialized:', initialized, 'session:', !!session, 'user:', !!user, 'profile:', !!profile);
    
    // Evitar execução dupla
    if (initialized) {
      console.log('🔍 AuthContext: Already initialized, skipping');
      return;
    }

    // Check if we're on a public route that doesn't need authentication
    const isPublicRoute = () => {
      const path = window.location.pathname;
      return path === '/' || 
             path === '/auth' || 
             path.startsWith('/survey/') || 
             path.startsWith('/nps/') || 
             path === '*';
    };

    console.log('🔍 AuthContext: Setting up auth listener');
    
    // Set up auth state listener (always needed for login/logout events)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 AuthContext: Auth state change event:', event, 'session:', !!session);
        
        if (event === 'SIGNED_OUT') {
          console.log('🔍 AuthContext: Handling SIGNED_OUT event, isSigningOut:', isSigningOut);
          if (isSigningOut) {
            handleSuccessfulLogout();
          } else {
            clearAuthState();
            clearAllAuthStorage();
          }
          setLoading(false);
          setInitialized(true);
          return;
        }
        
        if (event === 'SIGNED_IN' && session) {
          console.log('🔍 AuthContext: SIGNED_IN event triggered for user:', session.user.id);
          setSession(session);
          setUser(session.user);
          
          // Aguardar um pouco mais para evitar race conditions
          setTimeout(() => {
            console.log('🔍 AuthContext: Calling fetchProfile for SIGNED_IN user:', session.user.id);
            fetchProfile(session.user.id);
          }, 100);
        }
        
        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔍 AuthContext: TOKEN_REFRESHED event for user:', session.user.id);
          setSession(session);
          setUser(session.user);
          
          if (session.user && session.user.id !== user?.id) {
            console.log('🔍 AuthContext: User ID changed, calling fetchProfile for TOKEN_REFRESHED user:', session.user.id);
            setTimeout(() => {
              fetchProfile(session.user.id);
            }, 100);
          }
        }
        
        setLoading(false);
        setInitialized(true);
      }
    );

    // If on public route, skip session initialization but keep listener active
    if (isPublicRoute()) {
      console.log('🔍 AuthContext: On public route, skipping session check');
      setLoading(false);
      setInitialized(true);
    } else {
      console.log('🔍 AuthContext: On protected route, checking existing session');
      // Check for existing session only on protected routes
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('🔍 AuthContext: Existing session check result:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('🔍 AuthContext: Found existing session for user:', session.user.id);
          setTimeout(() => {
            console.log('🔍 AuthContext: Calling fetchProfile for existing session user:', session.user.id);
            fetchProfile(session.user.id);
          }, 100);
        } else {
          console.log('🔍 AuthContext: No existing session, trying to load from storage');
          // If no session, try to load profile from sessionStorage (for temporary profiles)
          loadProfileFromStorage();
        }
        
        setLoading(false);
        setInitialized(true);
      }).catch((error) => {
        console.error('❌ AuthContext: Error getting initial session:', error);
        // Even if session fails, try to load profile from storage
        loadProfileFromStorage();
        setLoading(false);
        setInitialized(true);
      });
    }

    return () => subscription.unsubscribe();
  }, [initialized]);

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

  // Monitor profile changes and dispatch event when it's loaded
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
    console.log('🔍 AuthContext: updateProfile called with:', updates);
    
    if (!user) {
      console.log('❌ AuthContext: User not logged in');
      return { error: 'Usuário não está logado' };
    }

    try {
      console.log('🔍 AuthContext: Updating profile in database...');
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ AuthContext: Error updating profile:', error);
        return { error: error.message };
      }

      console.log('✅ AuthContext: Profile updated in database:', data);
      
      // Atualizar o estado local imediatamente
      if (data) {
        console.log('🔍 AuthContext: Setting profile state with new data...');
        setProfile(data);
        console.log('✅ AuthContext: Profile state updated');
      }
      
      // Buscar o perfil atualizado para garantir sincronização
      console.log('🔍 AuthContext: Fetching fresh profile data...');
      await fetchProfile(user.id);
      console.log('✅ AuthContext: Profile sync completed');
      
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

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    resendConfirmation,
    forceLogout,
    forceRefreshProfile,
  };
  
  // Auth context value logging disabled

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
