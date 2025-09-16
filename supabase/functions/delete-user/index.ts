import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? '*' 
    : 'http://localhost:8081',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
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
    
    // First, try to find the user in the users table
    const { data: userRecord, error: userFindError } = await supabaseClient
      .from('users')
      .select('id, auth_user_id, email, full_name')
      .or(`auth_user_id.eq.${userId},id.eq.${userId}`)
      .single()
    
    if (userFindError) {
      console.error('Error finding user:', userFindError)
      return new Response(
        JSON.stringify({
          success: false,
          error: `User not found: ${userFindError.message}`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    console.log('User found:', userRecord)

    const deletedFrom = []
    const errors = []
    const hasAuthUserId = userRecord.auth_user_id !== null

    // Delete from users table first
    try {
      const { error: userError } = await supabaseClient
        .from('users')
        .delete()
        .eq('id', userRecord.id)
      
      if (userError) {
        console.error('Error deleting from users:', userError)
        errors.push(`users: ${userError.message}`)
      } else {
        deletedFrom.push('users')
        console.log(`Deleted user ${userRecord.id} from users table`)
      }
    } catch (error) {
      console.error('Exception deleting from users:', error)
      errors.push(`users: ${error.message}`)
    }

    // Only try to delete from auth.users if the user has an auth_user_id
    if (hasAuthUserId) {
      try {
        const { error: authDeleteError } = await supabaseClient.auth.admin.deleteUser(userRecord.auth_user_id)
        
        if (authDeleteError) {
          console.error('Error deleting from auth.users:', authDeleteError)
          errors.push(`auth.users: ${authDeleteError.message}`)
        } else {
          deletedFrom.push('auth.users')
          console.log(`Deleted user ${userRecord.auth_user_id} from auth.users`)
        }
      } catch (error) {
        console.error('Exception deleting from auth.users:', error)
        errors.push(`auth.users: ${error.message}`)
      }
    } else {
      console.log('User has no auth_user_id, skipping auth.users deletion')
      deletedFrom.push('users (no auth record)')
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