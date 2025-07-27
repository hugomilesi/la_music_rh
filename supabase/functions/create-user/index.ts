import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  department: string;
  position: string;
  phone?: string;
  role: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }

  try {
    console.log('Starting user creation process...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('Environment variables loaded:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the authorization header to verify the current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Create client with user's token to verify permissions
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Get current user
    console.log('Getting current user...');
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    
    console.log('User auth result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: userError?.message
    });
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Check user permissions
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role, preferences')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Check if user has admin permissions or is a special user
    const isSpecialUser = user.id === '51338e9f-8e1f-4b68-b330-a2b7f61eea98' || 
                         user.id === 'b42c122e-9b8a-4318-a319-691824583fac' ||
                         user.id === '32349eb8-daae-4c8f-849c-18af9552c000' ||
                         user.email === 'madorgas295@gmail.com';
    const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
    const isSuperUser = profile.preferences?.super_user === true;
    
    if (!isSpecialUser && !isAdmin && !isSuperUser) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to create users' }),
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    console.log('Parsing request data...');
    const requestData: CreateUserRequest = await req.json();
    console.log('Request data parsed successfully:', {
      hasEmail: !!requestData.email,
      hasPassword: !!requestData.password,
      hasName: !!requestData.name,
      hasDepartment: !!requestData.department,
      hasPosition: !!requestData.position,
      hasRole: !!requestData.role
    });
    
    const {
      email,
      password,
      name,
      department,
      position,
      phone,
      role
    } = requestData;
    
    // Validação de campos obrigatórios
    const validationErrors: string[] = [];
    
    if (!email || email.trim() === '') {
      validationErrors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push('Email deve ter um formato válido');
    }
    
    if (!password || password.trim() === '') {
      validationErrors.push('Senha é obrigatória');
    } else if (password.length < 6) {
      validationErrors.push('Senha deve ter pelo menos 6 caracteres');
    }
    
    if (!name || name.trim() === '') {
      validationErrors.push('Nome completo é obrigatório');
    } else if (name.trim().length < 2) {
      validationErrors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!position || position.trim() === '') {
      validationErrors.push('Cargo é obrigatório');
    }
    
    if (!role || !['admin', 'coordenador', 'professor', 'usuario'].includes(role)) {
      validationErrors.push('Perfil de usuário é obrigatório e deve ser válido');
    }
    
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return new Response(
        JSON.stringify({
          error: 'Dados inválidos',
          details: validationErrors,
          message: `Por favor, corrija os seguintes campos: ${validationErrors.join(', ')}`
        }),
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    
    console.log('Starting user creation with data:', {
      email,
      name,
      department,
      position,
      role
    });

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create auth user
    console.log('Creating auth user with email:', email);
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Auth error details:', {
        message: authError.message,
        status: authError.status,
        code: authError.code,
        details: authError
      });
      
      // Check if it's an email already exists error
      if (authError.code === 'email_exists' || authError.message.includes('already been registered')) {
        return new Response(
          JSON.stringify({
            error: 'Email já cadastrado no sistema',
            message: 'Este email já está sendo usado por outro usuário. Por favor, use um email diferente.',
            code: 'email_exists'
          }),
          {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }
      
      throw new Error(`Failed to create auth user: ${authError.message} (Code: ${authError.code}, Status: ${authError.status})`);
    }

    if (!authUser.user) {
      console.error('No user returned from auth creation');
      throw new Error('Failed to create auth user: No user data returned');
    }

    console.log('Auth user created successfully:', authUser.user.id);

    const userId = authUser.user.id;

    try {
      // Create user record in the unified users table
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_user_id: userId,
          email: email,
          full_name: name,
          phone: phone || null,
          position: position,
          department: department || 'Não informado',
          role: role,
          status: 'ativo',
          preferences: role === 'admin' ? { super_user: true } : {}
        })
        .select()
        .single();

      if (userError) {
        throw new Error(`Failed to create user: ${userError.message}`);
      }

      if (!userData) {
        throw new Error('No result from user creation');
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: userId,
            email
          }
        }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );

    } catch (error) {
      // If employee or profile creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw error;
    }

  } catch (error) {
    console.error('Error creating user:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Try to log request data if it exists
    try {
      if (typeof requestData !== 'undefined') {
        console.error('Request data received:', JSON.stringify(requestData, null, 2));
      } else {
        console.error('Request data was not defined when error occurred');
      }
    } catch (logError) {
      console.error('Failed to log request data:', logError);
    }
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : 'No additional details'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});