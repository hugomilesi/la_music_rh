import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? '*' 
    : '*',
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
      .select('id, auth_user_id, email, username')
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

    // Delete related data in cascade order (child tables first)
    // Including all tables with foreign key constraints to users table
    const cascadeTables = [
      'audit_logs',
      'vacation_requests', 
      'employee_benefits',
      'documents',
      'notifications',
      'evaluations',
      'incidents',
      'login_logs',
      'message_schedules',
      'nps_responses',
      'payroll_entries',
      'schedule_events',
      'system_logs',
      'vacation_balances'
    ]

    // Delete from related tables first
    for (const tableName of cascadeTables) {
      try {
        console.log(`Attempting to delete from ${tableName} for user ${userRecord.id}`)
        
        // Try different possible foreign key column names
        const possibleColumns = ['employee_id', 'user_id', 'created_by', 'updated_by', 'assigned_to', 'reported_by', 'evaluator_id', 'approved_by', 'uploaded_by']
        let deleted = false
        
        for (const column of possibleColumns) {
          try {
            const { data: checkData, error: checkError } = await supabaseClient
              .from(tableName)
              .select('*')
              .eq(column, userRecord.id)
              .limit(1)
            
            if (!checkError && checkData && checkData.length > 0) {
              const { error: deleteError } = await supabaseClient
                .from(tableName)
                .delete()
                .eq(column, userRecord.id)
              
              if (deleteError) {
                console.error(`Error deleting from ${tableName}.${column}:`, deleteError)
                errors.push(`${tableName}.${column}: ${deleteError.message}`)
              } else {
                deletedFrom.push(`${tableName} (${column})`)
                console.log(`✅ Deleted records from ${tableName}.${column} for user ${userRecord.id}`)
                deleted = true
                break
              }
            }
          } catch (columnError) {
            // Column doesn't exist, continue to next column
            continue
          }
        }
        
        if (!deleted) {
          console.log(`No records found in ${tableName} for user ${userRecord.id}`)
        }
      } catch (error) {
        console.error(`Exception processing ${tableName}:`, error)
        errors.push(`${tableName}: ${error.message}`)
      }
    }

    // Also handle departments table (which might reference user as manager)
    try {
      console.log(`Checking departments managed by user ${userRecord.id}`)
      const { data: managedDepts, error: deptCheckError } = await supabaseClient
        .from('departments')
        .select('*')
        .eq('manager_id', userRecord.id)
      
      if (!deptCheckError && managedDepts && managedDepts.length > 0) {
        // Set manager_id to null instead of deleting departments
        const { error: deptUpdateError } = await supabaseClient
          .from('departments')
          .update({ manager_id: null })
          .eq('manager_id', userRecord.id)
        
        if (deptUpdateError) {
          console.error('Error updating departments manager_id:', deptUpdateError)
          errors.push(`departments: ${deptUpdateError.message}`)
        } else {
          deletedFrom.push('departments (manager_id set to null)')
          console.log(`✅ Updated departments managed by user ${userRecord.id}`)
        }
      }
    } catch (error) {
      console.error('Exception processing departments:', error)
      errors.push(`departments: ${error.message}`)
    }

    // Now delete from users table
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
        console.log(`✅ Deleted user ${userRecord.id} from users table`)
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
      console.error("⚠️ Error deleting from auth.users:", authDeleteError.message)
      errors.push(`auth.users: ${authDeleteError.message}`)
    } else {
      deletedFrom.push("auth.users")
      console.log(`✅ Deleted user ${userRecord.auth_user_id} from auth.users`)
    }
  } catch (error) {
    console.error("⚠️ Exception deleting from auth.users:", error)
    errors.push(`auth.users: ${error instanceof Error ? error.message : "unknown error"}`)
  }
} else {
  console.log("User has no auth_user_id, skipping auth.users deletion")
  deletedFrom.push("users (no auth record)")
}

// ✅ Consider success if removed from users (even if auth.users failed)
const success = deletedFrom.includes("users")
const message = success 
  ? `User deleted (partially) from: ${deletedFrom.join(", ")}`
  : "Failed to delete user from users table"

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
        status: success ? (errors.length > 0 ? 207 : 200) : 500
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