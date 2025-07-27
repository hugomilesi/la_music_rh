import { supabase } from '@/lib/supabase';
import { CreateUserFormData } from '@/types/userFormSchemas';

interface CreateUserResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    password: string;
    name: string;
    position: string;
    department?: string;
  }
}

// Função para deletar colaborador
export async function deleteEmployee(employeeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: dbResult, error: dbError } = await supabase
      .rpc('delete_employee', {
        emp_id: employeeId
      });
    
    if (dbError) {
      return {
        success: false,
        error: `Erro ao deletar colaborador: ${dbError.message}`
      };
    }
    
    // As funções RPC retornam TABLE, então dbResult é um array
    if (dbResult && Array.isArray(dbResult) && dbResult.length > 0) {
      const result = dbResult[0];
      return {
        success: result.success,
        error: result.success ? undefined : result.message
      };
    }
    
    return {
      success: false,
      error: 'Resposta inesperada do banco de dados'
    };
    
  } catch (error) {
    console.error('Erro ao deletar colaborador:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para atualizar colaborador
export async function updateEmployee(employeeId: string, updateData: Partial<CreateUserFormData>): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: dbResult, error: dbError } = await supabase
      .rpc('update_employee', {
        emp_id: employeeId,
        emp_name: updateData.name,
        emp_email: updateData.email,
        emp_phone: updateData.phone,
        emp_position: updateData.position,
        emp_department: updateData.department,
        emp_status: updateData.status
      });
    
    if (dbError) {
      return {
        success: false,
        error: `Erro ao atualizar colaborador: ${dbError.message}`
      };
    }
    
    // As funções RPC retornam TABLE, então dbResult é um array
    if (dbResult && Array.isArray(dbResult) && dbResult.length > 0) {
      const result = dbResult[0];
      
      // Note: Role updates should now be handled through the secure
      // role_permissions table and update_role_permissions RPC function
      
      return {
        success: result.success,
        error: result.success ? undefined : result.message
      };
    }
    
    return {
      success: false,
      error: 'Resposta inesperada do banco de dados'
    };
    
  } catch (error) {
    console.error('Erro ao atualizar colaborador:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para gerar senha aleatória no frontend
function generateRandomPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createUserWithAutoPassword(userData: CreateUserFormData): Promise<CreateUserResult> {
  try {
    // Gerar senha automática
    const autoPassword = generateRandomPassword(12);
    
    // Get current session to ensure we have auth token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return {
        success: false,
        error: 'Usuário não autenticado. Faça login novamente.'
      };
    }
    
    // Debug: Log current user and profile info
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const { data: currentProfile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', currentUser?.id)
      .single();
    
    console.log('Debug - Current user info:', {
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      profileRole: currentProfile?.role,
      profilePreferences: currentProfile?.preferences,
      profileStatus: currentProfile?.status
    });
    
    // Call the Edge Function to create user
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        position: userData.position,
        department: userData.department,
        role: userData.role,
        password: autoPassword
      }
    });

    if (error) {
      console.error('Erro na Edge Function:', error);
      return {
        success: false,
        error: `Erro ao criar usuário: ${error.message}`
      };
    }

    if (!data.success) {
      // Check if it's an email already exists error
      if (data.code === 'email_exists' || data.error?.includes('Email já cadastrado no sistema')) {
        return {
          success: false,
          error: 'Email já cadastrado no sistema'
        };
      }
      
      return {
        success: false,
        error: data.error || 'Erro desconhecido ao criar usuário'
      };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: userData.email,
        password: autoPassword,
        name: userData.name,
        position: userData.position,
        department: userData.department
      }
    };
    
  } catch (error) {
    console.error('Erro geral ao criar usuário:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Removed insecure permission and role update functions
// These operations should now be handled through the secure
// role_permissions table and update_role_permissions RPC function