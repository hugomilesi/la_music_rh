import { supabase } from '@/integrations/supabase/client';
import { SystemUser, RoleData, SystemStats } from '@/types/settings';
import { updateSystemUserAsAdmin } from './adminService';

/**
 * Fetch all system users from unified users table
 */
export const fetchSystemUsers = async (): Promise<SystemUser[]> => {
  try {
    // Get all users from the unified users table (excluding soft deleted ones)
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        auth_user_id,
        email,
        full_name,
        role,
        position,
        department,
        phone,
        status,
        created_at,
        last_login,
        preferences
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!usersData) {
      return [];
    }

    // Transform data to SystemUser format
    const systemUsers: SystemUser[] = usersData.map((user: any) => ({
      id: user.id,
      name: user.full_name || 'Usuário sem nome',
      email: user.email,
      role: user.role || 'usuario',
      position: user.position || 'Não informado',
      department: user.department || 'Não informado',
      phone: user.phone || 'Não informado',
      status: user.status === 'ativo' ? 'active' : 'inactive',
      lastAccess: user.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR') : 'Nunca acessou',
      createdAt: new Date(user.created_at).toLocaleDateString('pt-BR'),
      permissions: [], // Permissions now managed by role_permissions table
      hasProfile: true
    }));

    return systemUsers;
  } catch (error) {
    console.error('Error in fetchSystemUsers:', error);
    throw error;
  }
};

/**
 * Fetch roles data from unified users table
 */
export const fetchRolesData = async (): Promise<RoleData[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('position, department')
      .eq('status', 'ativo')
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching roles data:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Group by position and department, count users
    const roleMap = new Map<string, { department: string; count: number }>();
    
    data.forEach((user: any) => {
      const position = user.position || 'Não informado';
      const department = user.department || 'Não informado';
      const key = `${position}-${department}`;
      if (roleMap.has(key)) {
        roleMap.get(key)!.count++;
      } else {
        roleMap.set(key, {
          department: department,
          count: 1
        });
      }
    });

    // Convert to RoleData array
    return Array.from(roleMap.entries()).map(([key, value], index) => {
      const position = key.split('-')[0];
      return {
        id: `role-${index + 1}`,
        name: position,
        department: value.department,
        employees: value.count
      };
    });
  } catch (error) {
    console.error('Error in fetchRolesData:', error);
    throw error;
  }
};

/**
 * Fetch system statistics
 */
export const fetchSystemStats = async (): Promise<SystemStats> => {
  try {
    // Get total users from unified table
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo')
      .is('deleted_at', null);

    if (userError) {
      console.error('Error fetching user count:', userError);
    }

    // Get unique departments count as "units"
    const { data: departmentsData, error: departmentsError } = await supabase
      .from('users')
      .select('department')
      .eq('status', 'ativo')
      .is('deleted_at', null);

    let activeUnits = 0;
    if (!departmentsError && departmentsData) {
      const allDepartments = new Set<string>();
      departmentsData.forEach((user: any) => {
        if (user.department && user.department !== 'Não informado') {
          allDepartments.add(user.department);
        }
      });
      activeUnits = allDepartments.size;
    }

    return {
      totalEmployees: userCount || 0, // Using same count for both since we unified the tables
      totalUsers: userCount || 0,
      activeUnits,
      lastBackup: new Date().toLocaleDateString('pt-BR') + ' 02:00'
    };
  } catch (error) {
    console.error('Error in fetchSystemStats:', error);
    return {
      totalEmployees: 0,
      totalUsers: 0,
      activeUnits: 0,
      lastBackup: 'Não disponível'
    };
  }
};

// Removed getPermissionsFromRole function - permissions now managed by role_permissions table

/**
 * List all users in the system with synchronization status
 */
export const listAllSystemUsers = async () => {
  try {
    console.log('📋 Fetching all system users...');
    
    const { data, error } = await supabase.functions.invoke('list-all-users');

    if (error) {
      console.error('❌ Error calling list-all-users function:', error);
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }

    if (!data.success) {
      console.error('❌ List users function returned error:', data.error);
      throw new Error(data.error || 'Erro desconhecido ao buscar usuários');
    }

    console.log('✅ Users fetched successfully:', data.stats);
    return data;
  } catch (error) {
    console.error('❌ Error in listAllSystemUsers:', error);
    throw error;
  }
};

/**
 * Delete a system user
 */
export const deleteSystemUser = async (userId: string): Promise<void> => {
  try {
    console.log('🗑️ deleteSystemUser called with userId:', userId);
    
    // Use the Edge Function to properly delete user from all tables
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: {
        userId: userId
      }
    });

    if (error) {
      console.error('❌ Error calling delete-user function:', error);
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }

    if (!data.success) {
      console.error('❌ Delete user function returned error:', data.error);
      throw new Error(data.error || 'Erro desconhecido ao deletar usuário');
    }

    console.log('✅ User deleted successfully from all tables:', data.deletedFrom);
  } catch (error) {
    console.error('❌ Error in deleteSystemUser:', error);
    throw error;
  }
};

/**
 * Update a system user
 */
export const updateSystemUser = async (userId: string, updates: Partial<SystemUser>): Promise<void> => {
  try {
    console.log('updateSystemUser called with:', { userId, updates });
    
    // Update user data in the unified users table
    const userUpdateData = {
      full_name: updates.name,
      role: updates.role,
      department: updates.department,
      position: updates.position,
      phone: updates.phone,
      status: updates.status === 'active' ? 'ativo' : 'inativo',
      updated_at: new Date().toISOString()
    };
    
    // Try to update by auth_user_id first, then by id if that fails
    const { error: userError } = await supabase
      .from('users')
      .update(userUpdateData)
      .eq('auth_user_id', userId);

    // If no rows were affected and userId looks like a number, try updating by id
    if (userError?.code === 'PGRST116' || (!userError && userId.match(/^\d+$/))) {
      const { error: idError } = await supabase
        .from('users')
        .update(userUpdateData)
        .eq('id', parseInt(userId));
      
      if (idError) {
        console.error('Error updating user by id:', idError);
        throw idError;
      }
    } else if (userError) {
      console.error('Error updating user by auth_user_id:', userError);
      throw userError;
    }

    console.log('User updated successfully');
  } catch (error) {
    console.error('Error in updateSystemUser:', error);
    throw error;
  }
};