import { supabase } from '@/integrations/supabase/client';
import { CreateUserFormData } from '@/types/userFormSchemas';

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// Input validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>"'&]/g, '');
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

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
  // Rate limiting check
  if (!checkRateLimit(`delete_${employeeId}`)) {
    return {
      success: false,
      error: 'Muitas tentativas. Tente novamente em alguns minutos.'
    };
  }

  // Input validation
  if (!employeeId || typeof employeeId !== 'string' || employeeId.trim().length === 0) {
    return {
      success: false,
      error: 'ID do colaborador inválido'
    };
  }

  const sanitizedId = sanitizeInput(employeeId);
  
  try {
    const { data: dbResult, error: dbError } = await supabase
      .rpc('delete_employee', {
        emp_id: sanitizedId
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
    // Log desabilitado: Error deleting collaborator
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
    // Log desabilitado: Error updating collaborator
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para gerar senha aleatória no frontend
function generateRandomPassword(length: number = 12): string {
  // Ensure minimum length for security
  const minLength = Math.max(length, 12);
  
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Ensure at least one character from each category
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest with random characters
  const allChars = lowercase + uppercase + numbers + symbols;
  for (let i = password.length; i < minLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function createUserWithAutoPassword(userData: CreateUserFormData): Promise<CreateUserResult> {
  // Rate limiting check
  if (!checkRateLimit(`create_user_${userData.email}`)) {
    return {
      success: false,
      error: 'Muitas tentativas de criação de usuário. Tente novamente em alguns minutos.'
    };
  }

  // Input validation
  if (!validateEmail(userData.email)) {
    return {
      success: false,
      error: 'Email inválido'
    };
  }

  if (!userData.name || userData.name.trim().length < 2) {
    return {
      success: false,
      error: 'Nome deve ter pelo menos 2 caracteres'
    };
  }

  if (!userData.position || userData.position.trim().length < 2) {
    return {
      success: false,
      error: 'Cargo deve ter pelo menos 2 caracteres'
    };
  }

  // Sanitize inputs
  const sanitizedUserData = {
    ...userData,
    email: sanitizeInput(userData.email.toLowerCase()),
    name: sanitizeInput(userData.name),
    position: sanitizeInput(userData.position),
    department: userData.department ? sanitizeInput(userData.department) : undefined
  };

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
    
    // Log desabilitado: Debug - Current user info
    
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
      // Log desabilitado: Edge Function error
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
    // Log desabilitado: Error creating collaborator
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Removed insecure permission and role update functions
// These operations should now be handled through the secure
// role_permissions table and update_role_permissions RPC function