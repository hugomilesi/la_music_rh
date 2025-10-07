import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
function getCorsHeaders(req) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true"
  };
}
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  try {
    console.log('Starting user creation process...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
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
      return new Response(JSON.stringify({
        error: 'Authorization header required'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    // Create client with user's token to verify permissions
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY'), {
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
      return new Response(JSON.stringify({
        error: 'Invalid or expired token'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    // Check user permissions
    const { data: profile, error: profileError } = await supabaseAdmin.from('users').select('role, preferences').eq('auth_user_id', user.id).single();
    if (profileError || !profile) {
      return new Response(JSON.stringify({
        error: 'User profile not found'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    // Check if user has admin permissions or is a special user
    const isSpecialUser = user.id === '51338e9f-8e1f-4b68-b330-a2b7f61eea98' || user.id === 'b42c122e-9b8a-4318-a319-691824583fac' || user.id === '32349eb8-daae-4c8f-849c-18af9552c000' || user.email === 'madorgas295@gmail.com';
    const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
    const isSuperUser = profile.preferences?.super_user === true;
    if (!isSpecialUser && !isAdmin && !isSuperUser) {
      return new Response(JSON.stringify({
        error: 'Insufficient permissions to create users'
      }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    console.log('Parsing request data...');
    const requestData1 = await req.json();
    console.log('Request data parsed successfully:', {
      hasEmail: !!requestData1.email,
      hasPassword: !!requestData1.password,
      hasName: !!requestData1.name,
      hasDepartment: !!requestData1.department,
      hasPosition: !!requestData1.position,
      hasRole: !!requestData1.role,
      hasUnit: !!requestData1.unit
    });
    const { email, password, name, department, position, phone, role, unit, status } = requestData1;
    // Validação de campos obrigatórios
    const validationErrors = [];
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
    // Position is optional - only validate if provided
    if (position && position.trim() === '') {
      validationErrors.push('Cargo não pode estar vazio se fornecido');
    }
    if (!role || ![
      'super_admin',
      'admin',
      'gestor_rh',
      'gerente'
    ].includes(role)) {
      validationErrors.push('Perfil de usuário é obrigatório e deve ser válido');
    }
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return new Response(JSON.stringify({
        error: 'Dados inválidos',
        details: validationErrors,
        message: `Por favor, corrija os seguintes campos: ${validationErrors.join(', ')}`
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    // Check if email already exists in both auth.users and users table
    console.log('Checking if email already exists:', email);
    // Check auth.users first
    const { data: existingAuthUser, error: authCheckError } = await supabaseAdmin.auth.admin.listUsers();
    if (authCheckError) {
      console.error('Error checking existing auth users:', authCheckError);
      throw new Error('Failed to check if user already exists in auth');
    }
    const emailExists = existingAuthUser.users.some((user)=>user.email === email);
    if (emailExists) {
      console.log('Email already exists in auth.users:', email);
      return new Response(JSON.stringify({
        error: 'Email já cadastrado no sistema',
        message: 'Este email já está sendo usado por outro usuário. Por favor, use um email diferente.',
        code: 'email_exists',
        success: false
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    // Also check users table
    const { data: existingUser, error: checkError } = await supabaseAdmin.from('users').select('email').eq('email', email).single();
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError);
      throw new Error('Failed to check if user already exists');
    }
    if (existingUser) {
      console.log('Email already exists in users table:', email);
      return new Response(JSON.stringify({
        error: 'Email já cadastrado no sistema',
        message: 'Este email já está sendo usado por outro usuário. Por favor, use um email diferente.',
        code: 'email_exists',
        success: false
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    console.log('Starting user creation with data:', {
      email,
      name,
      role,
      unit,
      phone,
      status
    });
    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    // Create auth user with metadata
    console.log('Creating auth user with email:', email);
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        role: role,
        position: position || 'Não informado',
        department: department || 'Não informado',
        unit: unit || null,
        phone: phone || null
      }
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
        return new Response(JSON.stringify({
          error: 'Email já cadastrado no sistema',
          message: 'Este email já está sendo usado por outro usuário. Por favor, use um email diferente.',
          code: 'email_exists',
          success: false
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      // Check if it's a duplicate key constraint error
      if (authError.message && authError.message.includes('duplicate key value violates unique constraint')) {
        return new Response(JSON.stringify({
          error: 'Email já cadastrado no sistema',
          message: 'Este email já está sendo usado por outro usuário. Por favor, use um email diferente.',
          code: 'email_exists',
          success: false
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      throw new Error(`Failed to create auth user: ${authError.message} (Code: ${authError.code}, Status: ${authError.status})`);
    }
    if (!authUser.user) {
      console.error('No user returned from auth creation');
      throw new Error('Failed to create auth user: No user data returned');
    }
    console.log('Auth user created successfully:', authUser.user.id);
    const userId = authUser.user.id;
    // Create user in public.users table - ONLY with fields that exist in the table
    console.log('Creating user in public.users table...');
    const { data: publicUser, error: publicUserError } = await supabaseAdmin.from('users').insert({
      auth_user_id: userId,
      username: name,
      email: email,
      role: role,
      unit: unit || null,
      phone: phone || null,
      status: status || 'ativo',
      is_active: true
    }).select().single();
    if (publicUserError) {
      console.error('Failed to create user in public.users:', publicUserError);
      // If user creation in public table fails, we should clean up the auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log('Cleaned up auth user after public user creation failure');
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }
      throw new Error(`Failed to create user profile: ${publicUserError.message}`);
    }
    console.log('User created successfully in public.users:', publicUser.id);
    // Update user preferences if admin or super_admin
    if (role === 'admin' || role === 'super_admin') {
      const { error: updateError } = await supabaseAdmin.from('users').update({
        preferences: {
          super_user: true
        }
      }).eq('auth_user_id', userId);
      if (updateError) {
        console.warn('Failed to update admin preferences:', updateError.message);
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: 'Usuário criado com sucesso!',
      user: {
        id: userId,
        email,
        name,
        role,
        position: position || 'Não informado',
        department: department || 'Não informado',
        unit: unit || null,
        status: status || 'ativo'
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
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
    // Handle specific error types
    let errorMessage = 'Erro interno do servidor';
    let errorCode = 'internal_error';
    let statusCode = 500;
    if (error instanceof Error) {
      const errorMsg = error.message.toLowerCase();
      // Handle duplicate key constraint errors
      if (errorMsg.includes('duplicate key value violates unique constraint') || errorMsg.includes('users_email_key') || errorMsg.includes('user already registered')) {
        errorMessage = 'Este email já está cadastrado no sistema. Por favor, use um email diferente.';
        errorCode = 'email_exists';
        statusCode = 400;
      } else if (errorMsg.includes('email_exists') || errorMsg.includes('already been registered')) {
        errorMessage = 'Este email já está cadastrado no sistema. Por favor, use um email diferente.';
        errorCode = 'email_exists';
        statusCode = 400;
      } else if (errorMsg.includes('validation') || errorMsg.includes('invalid')) {
        errorMessage = 'Dados fornecidos são inválidos. Verifique os campos e tente novamente.';
        errorCode = 'validation_error';
        statusCode = 400;
      } else if (errorMsg.includes('permission') || errorMsg.includes('unauthorized')) {
        errorMessage = 'Você não tem permissão para realizar esta ação.';
        errorCode = 'permission_denied';
        statusCode = 403;
      } else {
        errorMessage = `Erro ao criar usuário: ${error.message}`;
      }
    }
    return new Response(JSON.stringify({
      error: errorMessage,
      code: errorCode,
      message: errorMessage,
      success: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});