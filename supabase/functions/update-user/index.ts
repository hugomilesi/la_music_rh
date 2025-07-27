import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface UpdateUserRequest {
  userId: string;
  updates: {
    full_name?: string;
    role?: string;
    department?: string;
    position?: string;
    phone?: string;
    status?: string;
  };
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
    console.log('Starting user update process...');
    
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

    // Create a regular client to verify the current user's permissions
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    console.log('Current user ID:', user.id);

    // Check if current user has admin permissions
    const { data: currentUserProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role, preferences')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching current user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user permissions' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    console.log('Current user profile:', currentUserProfile);

    // Check if user has admin permissions
    const isAdmin = currentUserProfile.role === 'admin' || 
                   currentUserProfile.role === 'super_admin' || 
                   (currentUserProfile.preferences && currentUserProfile.preferences.super_user === true);

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only administrators can update user profiles.' }),
        { 
          status: 403, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    // Parse request body
    const { userId, updates }: UpdateUserRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ error: 'Updates are required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    console.log('Updating user:', userId, 'with updates:', updates);

    // Prepare update data with timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Update the user in the unified users table using admin client
    const { data, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('auth_user_id', userId)
      .select();

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user profile', details: updateError.message }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }

    console.log('User profile updated successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User profile updated successfully',
        data: data
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
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
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