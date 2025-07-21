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

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const requestData: CreateUserRequest = await req.json();
    const {
      email,
      password,
      name,
      department,
      position,
      phone,
      role
    } = requestData;

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError || !authUser.user) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    const userId = authUser.user.id;

    try {
      // Create employee record using the existing RPC function
      const { data: dbResult, error: employeeError } = await supabaseAdmin
        .rpc('create_employee', {
          emp_name: name,
          emp_email: email,
          emp_phone: phone || null,
          emp_position: position,
          emp_department: department || 'Não informado',
          emp_units: [],
          emp_start_date: new Date().toISOString().split('T')[0]
        });

      if (employeeError) {
        throw new Error(`Failed to create employee: ${employeeError.message}`);
      }

      if (!dbResult || dbResult.length === 0) {
        throw new Error('No result from employee creation');
      }

      const result = dbResult[0];
      if (!result.success) {
        throw new Error(result.message || 'Failed to create employee');
      }

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          full_name: name,
          role,
          department,
          position,
          phone,
          status: 'active',
          preferences: role === 'admin' ? { super_user: true } : {}
        });

      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`);
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
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      // If employee or profile creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw error;
    }

  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});