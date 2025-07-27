import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Starting deletion process for user: ${userId}`)
    
    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(userId)
    if (authError || !authUser.user) {
      console.log(`User ${userId} not found in auth.users`)
      return new Response(
        JSON.stringify({ error: 'User not found in authentication system' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const deletedFrom = []
    const errors = []

    // Delete from unified users table
    try {
      const { error: userError } = await supabaseClient
        .from('users')
        .delete()
        .eq('auth_user_id', userId)
      
      if (userError) {
        console.error('Error deleting from users:', userError)
        errors.push(`users: ${userError.message}`)
      } else {
        deletedFrom.push('users')
        console.log(`Deleted user ${userId} from users table`)
      }
    } catch (error) {
      console.error('Exception deleting from users:', error)
      errors.push(`users: ${error.message}`)
    }

    // Delete from auth.users (this should be last)
    try {
      const { error: authDeleteError } = await supabaseClient.auth.admin.deleteUser(userId)
      
      if (authDeleteError) {
        console.error('Error deleting from auth.users:', authDeleteError)
        errors.push(`auth.users: ${authDeleteError.message}`)
      } else {
        deletedFrom.push('auth.users')
        console.log(`Deleted user ${userId} from auth.users`)
      }
    } catch (error) {
      console.error('Exception deleting from auth.users:', error)
      errors.push(`auth.users: ${error.message}`)
    }

    const success = deletedFrom.length > 0
    const message = success 
      ? `User deleted successfully from: ${deletedFrom.join(', ')}` 
      : 'Failed to delete user from any table'

    console.log(`Deletion process completed for user ${userId}:`, {
      success,
      deletedFrom,
      errors
    })

    return new Response(
      JSON.stringify({
        success,
        message,
        deletedFrom,
        errors: errors.length > 0 ? errors : undefined,
        userId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: success ? 200 : 500
      }
    )
  } catch (error) {
    console.error('Error in delete-user function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})