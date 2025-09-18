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
    
    console.log('🔍 fetchProfile called with:', { targetUserId, currentUserId: user?.id });
    
    if (!targetUserId) {
      console.log('❌ No targetUserId found, returning early');
      return;
    }

    try {
      console.log('🔍 Fetching profile from database for user:', targetUserId);
      
      // FORÇAR LIMPEZA DO CACHE - remover sessionStorage antes de buscar
      sessionStorage.removeItem('userProfile');
      console.log('🧹 Cleared profile cache from sessionStorage');
      
      // Buscar perfil diretamente da tabela users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', targetUserId)
        .single();

      console.log('🔍 Database query result:', { data, error });

      if (error) {
        console.log('❌ Error fetching profile:', error);
        return;
      }

      if (data) {
        console.log('✅ Profile fetched successfully:', {
          id: data.id,
          role: data.role,
          authUserId: data.auth_user_id,
          permissions: data.permissions
        });
        
        setProfile(data as Profile);
        // Salvar no sessionStorage APENAS após confirmar os dados do banco
        sessionStorage.setItem('userProfile', JSON.stringify(data));
        console.log('💾 Profile saved to sessionStorage with updated data');
        
        // Disparar evento profile-loaded imediatamente após atualizar o profile
        if (user) {
          console.log('🔥 Dispatching profile-loaded event from fetchProfile');
          window.dispatchEvent(new CustomEvent('profile-loaded', {
            detail: { profile: data as Profile, user }
          }));
        }
      } else {
        console.log('❌ No profile data returned from database');
      }
      
    } catch (error) {
      console.log('❌ Exception in fetchProfile:', error);
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

  const forceRefreshProfile = async () => {
    console.log('🔄 forceRefreshProfile called');
    
    if (!user?.id) {
      console.log('❌ No user ID available for profile refresh');
      return;
    }
    
    try {
      // Limpar completamente o cache
      sessionStorage.removeItem('userProfile');
      setProfile(null);
      
      // Invalidar cache de permissões
      invalidatePermissionsCache(user.id);
      console.log('🧹 Invalidated permissions cache for user:', user.id);
      
      console.log('🧹 Cleared all profile cache, fetching fresh data...');
      
      // Buscar dados frescos do banco
      await fetchProfile(user.id);
      
      console.log('✅ Profile refresh completed');
    } catch (error) {
      console.error('❌ Error in forceRefreshProfile:', error);
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
      console.log('🔥 Profile loaded:', {
        userId: user.id,
        profileRole: profile.role,
        profileId: profile.id,
        fullName: profile.username,
        authUserId: profile.auth_user_id
      });
      console.log('🔥 Current session:', supabase.auth.getSession());
      
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
