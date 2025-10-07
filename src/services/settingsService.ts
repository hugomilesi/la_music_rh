import { supabase } from '@/integrations/supabase/client';
import { SystemUser, RoleData, SystemStats } from '@/types/settings';
import { updateSystemUserAsAdmin } from './adminService';

/**
 * Fetch all system users from unified users table
 */
export const fetchSystemUsers = async (): Promise<SystemUser[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        auth_user_id,
        username,
        email,
        role,
        status,
        created_at,
        updated_at,
        last_login,
        phone,
        unit,
        is_active,
        preferences
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching system users:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(user => ({
      id: user.id,
      auth_user_id: user.auth_user_id,
      name: user.username || 'Nome não informado',
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'gerente',
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLogin: user.last_login,
      phone: user.phone || '',
      unit: user.unit || '',
      isActive: user.is_active ?? true,
      preferences: user.preferences || {}
    }));
  } catch (error) {
    console.error('Error in fetchSystemUsers:', error);
    throw error;
  }
};

export const fetchRolesData = async () => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transform data to match expected format
    const rolesData = data.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description || '',
      department_id: role.department_id,
      permissions: role.permissions || [],
      salary_range: {
        min: role.min_salary || 0,
        max: role.max_salary || 0
      },
      requirements: role.requirements || [],
      responsibilities: role.responsibilities || [],
      created_at: role.created_at,
      updated_at: role.updated_at
    }));

    return rolesData;
  } catch (error) {
    throw error;
  }
};

export const fetchSystemStats = async () => {
  try {
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    if (userError) {
    }

    // Get department count
    const { count: departmentCount, error: departmentError } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true });

    if (departmentError) {
    }

    // Get role count
    const { count: roleCount, error: roleError } = await supabase
      .from('roles')
      .select('*', { count: 'exact', head: true });

    if (roleError) {
    }

    // Get departments data for additional stats (optional)
    const { data: departments, error: departmentsError } = await supabase
      .from('departments')
      .select('id, name, description');

    if (departmentsError) {
    }

    const stats = {
      totalEmployees: userCount || 0,
      totalUsers: userCount || 0,
      activeUnits: departmentCount || 0,
      lastBackup: new Date().toLocaleDateString('pt-BR'),
      totalDepartments: departmentCount || 0,
      totalRoles: roleCount || 0,
      departments: departments || []
    };

    return stats;
  } catch (error) {
    // Return default stats instead of throwing
    return {
      totalEmployees: 0,
      totalUsers: 0,
      activeUnits: 0,
      lastBackup: 'Erro ao carregar',
      totalDepartments: 0,
      totalRoles: 0,
      departments: []
    };
  }
};

// Removed getPermissionsFromRole function - permissions now managed by role_permissions table

/**
 * List all users in the system with synchronization status
 * Falls back to fetchSystemUsers if edge function is not available
 */
export const listAllSystemUsers = async () => {
  try {
    // Use fetchSystemUsers directly since list-all-users edge function doesn't exist
    const users = await fetchSystemUsers();
    return {
      success: true,
      users: users.map(user => ({
        id: user.auth_user_id || user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        user_data: {
          id: user.id,
          auth_user_id: user.auth_user_id,
          email: user.email,
          username: user.username,
          role: user.role,
          phone: user.phone,
          status: user.status
        },
        sync_status: {
          has_user_record: true,
          user_deleted: false,
          status: user.status
        }
      })),
      statistics: {
        total_auth_users: users.length,
        total_users: users.length,
        active_users: users.filter(u => u.status === 'ativo').length,
        inactive_users: users.filter(u => u.status === 'inativo').length,
        suspended_users: 0,
        deleted_users: 0,
        orphaned_auth_users: 0,
        admin_users: users.filter(u => u.role === 'admin').length,
        regular_users: users.filter(u => u.role === 'gerente').length,
        gestor_rh_users: users.filter(u => u.role === 'gestor_rh').length,
        super_admin_users: users.filter(u => u.role === 'super_admin').length,
        sync_issues: 0
      }
    };
  } catch (error) {
    // Fallback: try to get users from the users table only
    try {
      const { data: fallbackUsers, error: fallbackError } = await supabase
        .from('users')
        .select(`
          id,
          auth_user_id,
          username,
          email,
          role,
          status,
          created_at,
          updated_at
        `);

      if (fallbackError) {
        throw fallbackError;
      }

      return fallbackUsers?.map(user => ({
        id: user.id,
        auth_user_id: user.auth_user_id,
        username: user.username,
        email: user.email,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
        profile_image_url: null,
        last_sign_in_at: null,
        email_confirmed_at: null
      })) || [];
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
};

/**
 * Delete a system user
 */
export const deleteSystemUser = async (userId: string): Promise<void> => {
  try {
    // Call the delete-user Edge Function
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: {
        userId: userId
      }
    });

    if (error) {
      throw error;
    }

    if (data && data.error) {
      throw new Error(data.error);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Updates a system user profile directly via Supabase client
 */
export const updateSystemUser = async (userId: string, updates: any): Promise<void> => {
  try {
    console.log('Updating user directly via Supabase client:', { userId, updates });

    // Map frontend fields to database columns
    const updateData: any = {};
    
    if (updates.name) updateData.username = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.role) updateData.role = updates.role;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.unit) updateData.unit = updates.unit;
    if (updates.status) updateData.status = updates.status;

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    console.log('Mapped update data:', updateData);

    // Update user directly using Supabase client
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('auth_user_id', userId)
      .select();

    if (error) {
      console.error('Database update error:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('User not found or no changes made');
    }

    console.log('User updated successfully:', data[0]);
  } catch (error) {
    console.error('Failed to update system user:', error);
    throw error;
  }
};