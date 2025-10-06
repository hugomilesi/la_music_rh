import { supabase } from '@/integrations/supabase/client';
import { SystemUser, RoleData, SystemStats } from '@/types/settings';
import { updateSystemUserAsAdmin } from './adminService';

/**
 * Fetch all system users from unified users table
 */
export const fetchSystemUsers = async (): Promise<SystemUser[]> => {
  try {
    // Get user profiles with position name from roles table
    const { data: userProfiles, error: usersError } = await supabase
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
        position_id,
        department,
        phone,
        roles!position_id(name)
      `)
      .is('deleted_at', null);

    if (usersError) {
      throw usersError;
    }

    if (!userProfiles || userProfiles.length === 0) {
      return [];
    }

    // Transform to SystemUser format
    const systemUsers: SystemUser[] = userProfiles.map(profile => ({
      id: profile.id,
      auth_user_id: profile.auth_user_id,
      username: profile.username,
      email: profile.email,
      role: profile.role,
      status: profile.status,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      profile_image_url: null, // Not available without auth data
      last_sign_in_at: profile.last_login,
      email_confirmed_at: null, // Not available without auth data
      name: profile.username,
      position: profile.roles?.name || 'Não informado',
      department: profile.department || 'Não informado',
      phone: profile.phone || 'Não informado'
    }));

    // Filter out legacy users (users without proper role structure)
    const validUsers = systemUsers.filter(user => {
      return user.role && ['super_admin', 'admin', 'gestor_rh', 'gerente'].includes(user.role);
    });

    return validUsers;
  } catch (error) {
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
          position: user.position,
          department: user.department,
          phone: user.phone,
          status: user.status === 'ativo' ? 'ativo' : 'inativo'
        },
        sync_status: {
          has_user_record: true,
          user_deleted: false,
          status: user.status === 'ativo' ? 'ativo' : 'inativo',
          role: user.role
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
        regular_users: users.filter(u => u.role === 'usuario').length,
        professor_users: users.filter(u => u.role === 'professor').length,
        manager_users: users.filter(u => u.role === 'manager').length,
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
        role: user.role,
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
 * Update a system user
 */
export const updateSystemUser = async (userId: string, updates: any): Promise<void> => {
  try {
    
    // Prepare update data
    const updateData: any = {};
    
    // Map UpdateSystemUserData fields to database fields
    if (updates.name) updateData.username = updates.name;
    if (updates.username) updateData.username = updates.username;
    if (updates.email) updateData.email = updates.email;
    if (updates.role) updateData.role = updates.role;
    if (updates.status) {
      // Mapear status do frontend para o formato do banco
      const statusMap: Record<string, string> = {
        'active': 'ativo',
        'inactive': 'inativo'
      };
      updateData.status = statusMap[updates.status] || updates.status;
    }
    // Position é enviado como nome do cargo, mas precisamos converter para position_id
    if (updates.position) {
      // Buscar o role_id baseado no nome do cargo
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', updates.position)
        .single();
      
      if (roleError) {
        throw new Error(`Cargo "${updates.position}" não encontrado`);
      }
      
      if (roleData) {
        updateData.position_id = roleData.id;
      }
    }
    if (updates.department) updateData.department = updates.department;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.unit) updateData.unit = updates.unit;
    if (updates.profile_image_url !== undefined) updateData.profile_image_url = updates.profile_image_url;
    
    updateData.updated_at = new Date().toISOString();


    // Try to update by auth_user_id first (more reliable)
    const { data: authUpdateData, error: authError } = await supabase
      .from('users')
      .update(updateData)
      .eq('auth_user_id', userId)
      .select();

    if (authError) {
      
      // If that fails, try by id
      const { data: idUpdateData, error: idError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select();
      
      if (idError) {
        throw idError;
      }
      
    } else {
    }
  } catch (error) {
    throw error;
  }
};