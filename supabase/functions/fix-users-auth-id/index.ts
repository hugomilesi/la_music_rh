import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? '*' 
    : 'http://localhost:8081',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
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
    console.log('Starting fix users auth_user_id process...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role key
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Supabase client created successfully');

    // Get users without auth_user_id
    const { data: usersWithoutAuthId, error: fetchError } = await supabaseClient
      .from('users')
      .select('id, email, full_name')
      .is('auth_user_id', null);

    if (fetchError) {
      console.error('Error fetching users without auth_user_id:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${usersWithoutAuthId?.length || 0} users without auth_user_id`);

    if (!usersWithoutAuthId || usersWithoutAuthId.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users found without auth_user_id',
          fixed_users: 0
        }),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    const fixedUsers = [];
    const errors = [];

    // Process each user without auth_user_id
    for (const user of usersWithoutAuthId) {
      try {
        console.log(`Processing user: ${user.email}`);

        // Try to find corresponding auth user by email
        const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers();
        
        if (authError) {
          console.error(`Error listing auth users for ${user.email}:`, authError);
          errors.push({
            user_id: user.id,
            email: user.email,
            error: `Failed to list auth users: ${authError.message}`
          });
          continue;
        }

        // Find auth user with matching email
        const matchingAuthUser = authUsers.users.find(authUser => 
          authUser.email?.toLowerCase() === user.email.toLowerCase()
        );

        if (!matchingAuthUser) {
          console.log(`No matching auth user found for ${user.email}`);
          errors.push({
            user_id: user.id,
            email: user.email,
            error: 'No matching auth user found'
          });
          continue;
        }

        console.log(`Found matching auth user for ${user.email}: ${matchingAuthUser.id}`);

        // Update the user with the auth_user_id
        const { error: updateError } = await supabaseClient
          .from('users')
          .update({ auth_user_id: matchingAuthUser.id })
          .eq('id', user.id);

        if (updateError) {
          console.error(`Error updating user ${user.email}:`, updateError);
          errors.push({
            user_id: user.id,
            email: user.email,
            error: `Failed to update: ${updateError.message}`
          });
          continue;
        }

        console.log(`Successfully updated user ${user.email} with auth_user_id: ${matchingAuthUser.id}`);
        fixedUsers.push({
          user_id: user.id,
          email: user.email,
          auth_user_id: matchingAuthUser.id,
          full_name: user.full_name
        });

      } catch (error) {
        console.error(`Unexpected error processing user ${user.email}:`, error);
        errors.push({
          user_id: user.id,
          email: user.email,
          error: `Unexpected error: ${error.message}`
        });
      }
    }

    console.log(`Process completed. Fixed: ${fixedUsers.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Fixed ${fixedUsers.length} users, ${errors.length} errors`,
        fixed_users: fixedUsers.length,
        error_count: errors.length,
        fixed_users_details: fixedUsers,
        errors: errors
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
    console.error('Unexpected error in fix-users-auth-id function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        details: error.message
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