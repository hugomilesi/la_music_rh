import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? '*' 
    : 'http://localhost:8081',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all auth users
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers();
    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }

    // Get all users from unified table
    const { data: users, error: usersError } = await supabaseClient
      .from('users')
      .select('*');
    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    // Combine and analyze data
    const combinedUsers = authUsers.users.map(authUser => {
      const user = users.find(u => u.auth_user_id === authUser.id);
      
      return {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        user_data: user || null,
        sync_status: {
          has_user_record: !!user,
          user_deleted: user?.deleted_at ? true : false,
          status: user?.status || 'unknown',
          role: user?.role || 'unknown'
        }
      };
    });

    // Calculate statistics
    const stats = {
      total_auth_users: authUsers.users.length,
      total_users: users.length,
      active_users: users.filter(u => !u.deleted_at && u.status === 'ativo').length,
      inactive_users: users.filter(u => !u.deleted_at && u.status === 'inativo').length,
      suspended_users: users.filter(u => !u.deleted_at && u.status === 'suspenso').length,
      deleted_users: users.filter(u => u.deleted_at).length,
      orphaned_auth_users: combinedUsers.filter(u => !u.sync_status.has_user_record).length,
      admin_users: users.filter(u => !u.deleted_at && u.role === 'admin').length,
      regular_users: users.filter(u => !u.deleted_at && u.role === 'usuario').length,
      professor_users: users.filter(u => !u.deleted_at && u.role === 'professor').length,
      manager_users: users.filter(u => !u.deleted_at && u.role === 'manager').length,
      sync_issues: combinedUsers.filter(u => 
        !u.sync_status.has_user_record || 
        u.sync_status.user_deleted
      ).length
    };

    return new Response(
      JSON.stringify({
        success: true,
        users: combinedUsers,
        statistics: stats,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in list-all-users function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});