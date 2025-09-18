import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

interface GenerateTokenRequest {
  phone: string;
  employee_name?: string;
  survey_id?: string;
}

interface ValidateTokenRequest {
  token: string;
}

interface NPSResponse {
  token: string;
  score: number;
  comment?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    console.log('Full URL:', url.href)
    console.log('Pathname:', url.pathname)
    
    // Extract path after /functions/v1/whatsapp-nps-v2
    let path = url.pathname.replace('/functions/v1/whatsapp-nps-v2', '') || '/'
    
    // Handle case where the path still contains the function name (from test script)
    if (path.startsWith('/whatsapp-nps-v2')) {
      path = path.replace('/whatsapp-nps-v2', '') || '/'
    }
    
    console.log('Extracted path:', path)
    console.log('Method:', req.method)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Root endpoint - GET /
    if (req.method === 'GET' && (path === '/' || path === '')) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'WhatsApp NPS v2 Edge Function',
          version: '2.0.0',
          endpoints: {
            'POST /generate-token': 'Generate access token for NPS survey',
            'POST /validate-token': 'Validate access token',
            'GET /schedules': 'Get NPS schedules',
            'POST /schedules': 'Create NPS schedule',
            'PUT /schedules/:id': 'Update NPS schedule',
            'DELETE /schedules/:id': 'Delete NPS schedule',
            'POST /responses': 'Submit NPS response',
            'GET /responses': 'Get NPS responses',
            'POST /cleanup': 'Cleanup expired tokens',
            'GET /stats': 'Get NPS statistics'
          },
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Generate token endpoint - POST /generate-token
    if (req.method === 'POST' && path === '/generate-token') {
      const { phone } = await req.json()
      
      if (!phone) {
        return new Response(
          JSON.stringify({ error: 'Phone number is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Generate token (simple UUID-like string)
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Store token in database
      const { error } = await supabase
        .from('nps_tokens')
        .insert({
          token,
          user_phone: phone,
          user_name: null,
          employee_name: null,
          survey_id: null,
          expires_at: expiresAt.toISOString(),
          is_active: true
        })

      if (error) {
        console.error('Error storing token:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to generate token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          token,
          expires_at: expiresAt.toISOString(),
          survey_url: `${url.origin}/nps-survey?token=${token}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Validate token endpoint - POST /validate-token
    if (req.method === 'POST' && path === '/validate-token') {
      const { token } = await req.json()
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Token is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('nps_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .is('used_at', null)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Invalid token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      // Check if token is expired
      if (new Date(data.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Token expired' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      return new Response(
        JSON.stringify({
          valid: true,
          user_phone: data.user_phone,
          expires_at: data.expires_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Submit NPS response - POST /responses
    if (req.method === 'POST' && path === '/responses') {
      const { token, rating, feedback, unit } = await req.json()
      
      if (!token || rating === undefined) {
        return new Response(
          JSON.stringify({ error: 'Token and rating are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Validate token first
      const { data: tokenData, error: tokenError } = await supabase
        .from('nps_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .is('used_at', null)
        .single()

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Token expired' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Store NPS response
      const { error: responseError } = await supabase
        .from('nps_responses')
        .insert({
          phone_number: tokenData.user_phone,
          score: parseInt(rating),
          comment: feedback || null,
          response_token: token,
          response_date: new Date().toISOString().split('T')[0], // Only date part
          created_at: new Date().toISOString()
        })

      if (responseError) {
        console.error('Error storing NPS response:', responseError)
        return new Response(
          JSON.stringify({ error: 'Failed to store response', details: responseError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Mark token as used
      await supabase
        .from('nps_tokens')
        .update({ is_active: false, used_at: new Date().toISOString() })
        .eq('token', token)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'NPS response recorded successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Get NPS responses - GET /responses
    if (req.method === 'GET' && path === '/responses') {
      const { data, error } = await supabase
        .from('nps_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch responses' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Get NPS statistics - GET /stats
    if (req.method === 'GET' && path === '/stats') {
      const { data, error } = await supabase
        .from('nps_responses')
        .select('score, department, created_at')

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch statistics' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Calculate NPS score
      const promoters = data.filter(r => r.score >= 9).length
      const detractors = data.filter(r => r.score <= 6).length
      const total = data.length
      const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0

      // Group by department
      const byDepartment = data.reduce((acc, response) => {
        const department = response.department || 'Unknown'
        if (!acc[department]) {
          acc[department] = { total: 0, promoters: 0, detractors: 0, scores: [] }
        }
        acc[department].total++
        acc[department].scores.push(response.score)
        if (response.score >= 9) acc[department].promoters++
        if (response.score <= 6) acc[department].detractors++
        return acc
      }, {})

      // Calculate NPS by department
      Object.keys(byDepartment).forEach(department => {
        const deptData = byDepartment[department]
        deptData.nps = deptData.total > 0 
          ? Math.round(((deptData.promoters - deptData.detractors) / deptData.total) * 100)
          : 0
        deptData.averageScore = deptData.scores.length > 0
          ? Math.round((deptData.scores.reduce((a, b) => a + b, 0) / deptData.scores.length) * 10) / 10
          : 0
      })

      return new Response(
        JSON.stringify({
          success: true,
          stats: {
            total_responses: total,
            nps_score: npsScore,
            promoters,
            detractors,
            passives: total - promoters - detractors,
            by_department: byDepartment,
            average_score: total > 0 
              ? Math.round((data.reduce((sum, r) => sum + r.score, 0) / total) * 10) / 10 
              : 0
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Cleanup expired tokens - POST /cleanup
    if (req.method === 'POST' && path === '/cleanup') {
      const { error } = await supabase
        .from('nps_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to cleanup tokens' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Expired tokens cleaned up' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Route not found
    return new Response(
      JSON.stringify({ 
        error: 'Route not found',
        path: path,
        method: req.method,
        available_routes: [
          'GET /',
          'POST /generate-token',
          'POST /validate-token',
          'POST /responses',
          'GET /responses',
          'GET /stats',
          'POST /cleanup'
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})