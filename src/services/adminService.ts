import { supabase } from '@/integrations/supabase/client';

interface UpdateUserData {
  full_name?: string;
  role?: string;
  department?: string;
  position?: string;
  phone?: string;
  status?: string;
}

/**
 * Update a user profile with admin privileges
 * This function uses a direct API call to bypass RLS restrictions
 */
export const updateUserAsAdmin = async (userId: string, updates: UpdateUserData): Promise<void> => {
  try {
    console.log('updateUserAsAdmin called with:', { userId, updates });
    
    // Get the current session to include the auth token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session found');
    }

    // Get Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not found in environment variables');
    }

    // Prepare the update data
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    console.log('Sending direct API request to update user:', updateData);

    // Make a direct API call to Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/users?auth_user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API request failed:', response.status, errorText);
      throw new Error(`Failed to update user: ${response.status} ${errorText}`);
    }

    console.log('User updated successfully via direct API call');
  } catch (error) {
    console.error('Error in updateUserAsAdmin:', error);
    throw error;
  }
};

/**
 * Check if the current user has admin privileges
 */
export const checkAdminPrivileges = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (error) {
      console.error('Error checking admin privileges:', error);
      return false;
    }

    // Check permissions from role_permissions table
    const { data: rolePermissions, error: permError } = await supabase
      .from('role_permissions')
      .select('permissions')
      .eq('role', profile.role)
      .single();

    if (permError) {
      console.error('Error checking role permissions:', permError);
      return false;
    }

    // User has admin privileges if they can manage everything or access settings
    const permissions = rolePermissions?.permissions || [];
    return permissions.includes('canManageEverything') || permissions.includes('canAccessSettings');
  } catch (error) {
    console.error('Error in checkAdminPrivileges:', error);
    return false;
  }
};

/**
 * Update user with proper admin validation
 */
export const updateSystemUserAsAdmin = async (userId: string, updates: UpdateUserData): Promise<void> => {
  try {
    // First check if current user has admin privileges
    const hasAdminPrivileges = await checkAdminPrivileges();
    
    if (!hasAdminPrivileges) {
      throw new Error('Insufficient permissions. Only administrators can update user profiles.');
    }

    // Try the direct API approach first
    await updateUserAsAdmin(userId, updates);
    
    console.log('User profile updated successfully by admin');
  } catch (error) {
    console.error('Error in updateSystemUserAsAdmin:', error);
    throw error;
  }
};