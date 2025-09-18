import { supabase } from '@/integrations/supabase/client';

interface UpdateUserData {
  username?: string;
  role?: string;
  department?: string;
  position?: string;
  phone?: string;
  status?: string;
}

/**
 * Update a user profile with admin privileges
 * This function uses the centralized Supabase client
 */
export const updateUserAsAdmin = async (userId: string, updates: UpdateUserData): Promise<void> => {
  try {
    console.log('AdminService: Atualizando usuário como admin:', userId);
    
    // Prepare the update data
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Use the centralized Supabase client to update the user
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('auth_user_id', userId);

    if (error) {
      console.error('AdminService: Erro ao atualizar usuário:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
    
    console.log('AdminService: Usuário atualizado com sucesso');
  } catch (error) {
    console.error('AdminService: Erro em updateUserAsAdmin:', error);
    throw error;
  }
};

/**
 * Check if the current user has admin privileges
 */
export const checkAdminPrivileges = async (): Promise<boolean> => {
  try {
    console.log('AdminService: Verificando privilégios de admin');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('AdminService: Usuário não autenticado');
      return false;
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (error) {
      // Error checking admin privileges logging disabled
      return false;
    }

    // Check permissions from role_permissions table
    const { data: rolePermissions, error: permError } = await supabase
      .from('role_permissions')
      .select('permissions')
      .eq('role', profile.role)
      .single();

    if (permError) {
      // Error checking role permissions logging disabled
      return false;
    }

    // User has admin privileges if they can access settings
    const permissions = rolePermissions?.permissions || {};
    return permissions.configuracoes?.can_view || false;
  } catch (error) {
    // Error in checkAdminPrivileges logging disabled
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
    
    // User profile updated successfully logging disabled
  } catch (error) {
    // Error in updateSystemUserAsAdmin logging disabled
    throw error;
  }
};