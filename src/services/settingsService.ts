import { supabase } from '@/integrations/supabase/client';
import { SystemUser, RoleData, SystemStats } from '@/types/settings';
import { updateSystemUserAsAdmin } from './adminService';

/**
 * Fetch all system users from profiles table with email from auth.users
 */
export const fetchSystemUsers = async (): Promise<SystemUser[]> => {
  try {
    // First get profiles data
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        role,
        department,
        position,
        phone,
        status,
        preferences,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    // Get emails from auth.users for each profile
    const usersWithEmails = await Promise.all(
      profilesData.map(async (profile: any) => {
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.getUserById(profile.id);
          
          return {
            id: profile.id,
            name: profile.full_name || 'Nome não informado',
            email: authData?.user?.email || 'Email não disponível',
            role: profile.role || 'usuario',
            position: profile.position || 'Não informado',
            department: profile.department || 'Não informado',
            phone: profile.phone || 'Não informado',
            status: profile.status || 'active',
            lastAccess: 'Não disponível', // Would need to track this separately
            createdAt: new Date(profile.created_at).toLocaleDateString('pt-BR'),
            permissions: getPermissionsFromRole(profile.role, profile.preferences)
          };
        } catch (error) {
          console.error(`Error fetching email for user ${profile.id}:`, error);
          return {
            id: profile.id,
            name: profile.full_name || 'Nome não informado',
            email: 'Email não disponível',
            role: profile.role || 'usuario',
            position: profile.position || 'Não informado',
            department: profile.department || 'Não informado',
            phone: profile.phone || 'Não informado',
            status: profile.status || 'active',
            lastAccess: 'Não disponível',
            createdAt: new Date(profile.created_at).toLocaleDateString('pt-BR'),
            permissions: getPermissionsFromRole(profile.role, profile.preferences)
          };
        }
      })
    );

    return usersWithEmails;
  } catch (error) {
    console.error('Error in fetchSystemUsers:', error);
    throw error;
  }
};

/**
 * Fetch roles data from employees table
 */
export const fetchRolesData = async (): Promise<RoleData[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('position, department')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching roles data:', error);
      throw error;
    }

    // Group by position and department, count employees
    const roleMap = new Map<string, { department: string; count: number }>();
    
    data.forEach((employee: any) => {
      const key = `${employee.position}-${employee.department}`;
      if (roleMap.has(key)) {
        roleMap.get(key)!.count++;
      } else {
        roleMap.set(key, {
          department: employee.department,
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
    // Get total employees
    const { count: employeeCount, error: employeeError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (employeeError) {
      console.error('Error fetching employee count:', employeeError);
    }

    // Get total users
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (userError) {
      console.error('Error fetching user count:', userError);
    }

    // Get unique units count
    const { data: unitsData, error: unitsError } = await supabase
      .from('employees')
      .select('units')
      .eq('status', 'active');

    let activeUnits = 0;
    if (!unitsError && unitsData) {
      const allUnits = new Set<string>();
      unitsData.forEach((employee: any) => {
        if (employee.units && Array.isArray(employee.units)) {
          employee.units.forEach((unit: string) => allUnits.add(unit));
        }
      });
      activeUnits = allUnits.size;
    }

    return {
      totalEmployees: employeeCount || 0,
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

/**
 * Get permissions array based on role and preferences
 */
function getPermissionsFromRole(role: string, preferences: any): string[] {
  const basePermissions: string[] = [];
  
  switch (role) {
    case 'admin':
      return ['employees', 'documents', 'schedule', 'evaluations', 'settings', 'reports', 'users'];
    case 'coordenador':
      return ['employees', 'documents', 'schedule', 'evaluations', 'reports'];
    case 'professor':
      return ['documents', 'schedule'];
    case 'usuario':
    default:
      return ['documents'];
  }
}

/**
 * Delete a system user
 */
export const deleteSystemUser = async (userId: string): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId }
    });

    if (error) {
      console.error('Error calling delete-user function:', error);
      throw error;
    }

    if (data?.error) {
      console.error('Error from delete-user function:', data.error);
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Error in deleteSystemUser:', error);
    throw error;
  }
};

/**
 * Update a system user
 */
export const updateSystemUser = async (userId: string, updates: Partial<SystemUser>): Promise<void> => {
  try {
    console.log('updateSystemUser called with:', { userId, updates });
    
    const updateData = {
      full_name: updates.name,
      role: updates.role,
      department: updates.department,
      position: updates.position,
      phone: updates.phone,
      status: updates.status
    };
    
    console.log('Update data being sent to admin service:', updateData);
    
    // Use the admin service to update the user
    await updateSystemUserAsAdmin(userId, updateData);
    
    console.log('User updated successfully via admin service');
  } catch (error) {
    console.error('Error in updateSystemUser:', error);
    throw error;
  }
};