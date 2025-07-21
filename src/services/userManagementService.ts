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
  };
  error?: string;
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
    
    // Verificar se o email já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('employees')
      .select('id')
      .eq('email', userData.email)
      .single();
    
    if (existingUser) {
      return {
        success: false,
        error: 'Este email já está cadastrado no sistema'
      };
    }
    
    // Tentar usar a função do banco de dados primeiro
    const { data: dbResult, error: dbError } = await supabase
      .rpc('create_employee_with_auth', {
        p_name: userData.name,
        p_email: userData.email,
        p_password: autoPassword,
        p_cargo: userData.position,
        p_departamento: userData.department || 'Não informado',
        p_phone: userData.phone || null
      });
    
    if (dbResult && dbResult.success) {
      return {
        success: true,
        user: {
          id: dbResult.user_id,
          email: userData.email,
          password: autoPassword,
          name: userData.name,
          position: userData.position,
          department: userData.department
        }
      };
    }
    
    // Se a função do banco falhar, criar manualmente
    console.log('Função do banco falhou, criando manualmente:', dbError);
    
    // Gerar UUID para o usuário
    const userId = crypto.randomUUID();
    
    // Inserir na tabela employees
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        id: userId,
        name: userData.name,
        email: userData.email,
        cargo: userData.position,
        departamento: userData.department || 'Não informado',
        data_admissao: new Date().toISOString().split('T')[0],
        phone: userData.phone || null,
        position: userData.position,
        department: userData.department || 'Não informado',
        status: userData.status || 'active'
      })
      .select()
      .single();
    
    if (employeeError) {
      console.error('Erro ao criar employee:', employeeError);
      return {
        success: false,
        error: `Erro ao criar funcionário: ${employeeError.message}`
      };
    }
    
    // Inserir na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        nome: userData.name,
        cargo: userData.position,
        departamento: userData.department || 'Não informado',
        nivel: userData.role === 'admin' ? 'admin' : 'usuario',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error('Erro ao criar profile:', profileError);
      // Tentar remover o employee criado
      await supabase.from('employees').delete().eq('id', userId);
      return {
        success: false,
        error: `Erro ao criar perfil: ${profileError.message}`
      };
    }
    
    return {
      success: true,
      user: {
        id: userId,
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
        permissions: permissions,
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
        nivel: 'admin',
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
      .select('nivel, permissions')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      return { isAdmin: false, permissions: [] };
    }
    
    return {
      isAdmin: data.nivel === 'admin',
      permissions: data.permissions || []
    };
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return { isAdmin: false, permissions: [] };
  }
}