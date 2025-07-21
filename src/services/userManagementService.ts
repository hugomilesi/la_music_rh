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
    
    if (dbResult && dbResult.length > 0) {
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
    
    if (dbResult && dbResult.length > 0) {
      const result = dbResult[0];
      
      // Atualizar perfil se necessário
      if (updateData.role) {
        await supabase
          .from('profiles')
          .upsert({
            id: employeeId,
            full_name: updateData.name,
            role: updateData.role,
            department: updateData.department,
            position: updateData.position,
            phone: updateData.phone,
            preferences: updateData.role === 'admin' ? { super_user: true } : {}
          });
      }
      
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
      console.error('Erro ao criar usuário:', error);
      return {
        success: false,
        error: `Erro ao criar usuário: ${error.message}`
      };
    }

    if (!data.success) {
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

export async function updateUserPermissions(userId: string, permissions: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        preferences: { permissions: permissions },
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    return !error;
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    return false;
  }
}

export async function promoteToAdmin(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        role: 'admin',
        preferences: { super_user: true },
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    return !error;
  } catch (error) {
    console.error('Erro ao promover usuário:', error);
    return false;
  }
}

export async function checkUserPermissions(userId: string): Promise<{ isAdmin: boolean; permissions: string[] }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, preferences')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      return { isAdmin: false, permissions: [] };
    }
    
    return {
      isAdmin: data.role === 'admin',
      permissions: data.preferences?.permissions || []
    };
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return { isAdmin: false, permissions: [] };
  }
}