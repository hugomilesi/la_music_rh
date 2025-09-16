import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Interfaces
interface CreateScheduleRequest {
  name: string;
  survey_id: string;
  target_users?: string[];
  schedule_type?: string;
}

interface SendMessageRequest {
  schedule_id: string;
  phone_numbers: string[];
}

interface WebhookRequest {
  key: string;
  data: {
    messageId: string;
    status: string;
    timestamp: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/whatsapp-nps-v2', '');
    const method = req.method;

    console.log(`Request: ${method} ${path}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Route: POST /schedules - Criar agendamento
    if (path === '/schedules' && method === 'POST') {
      const body: CreateScheduleRequest = await req.json();
      
      // Nota: Esta função precisa ser atualizada para usar os parâmetros corretos
      // A função create_whatsapp_schedule espera: p_name, p_survey_id, p_target_users, p_schedule_type
      const { data, error } = await supabase
        .rpc('create_whatsapp_schedule', {
          p_name: body.name,
          p_survey_id: body.survey_id, // Este campo precisa ser adicionado ao body
          p_target_users: JSON.stringify(body.target_users || []), // Este campo precisa ser adicionado ao body
          p_schedule_type: 'immediate' // Valor padrão
        });

      if (error) {
        console.error('Error creating schedule:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create schedule', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, schedule_id: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /schedules - Listar agendamentos
    if (path === '/schedules' && method === 'GET') {
      const { data, error } = await supabase
        .from('message_schedules')
        .select('*')
        .eq('channel', 'whatsapp')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching schedules:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch schedules', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ schedules: data || [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /stats - Estatísticas de envio
    if (path === '/stats' && method === 'GET') {
      const { data, error } = await supabase
        .rpc('get_whatsapp_send_stats');

      if (error) {
        console.error('Error fetching stats:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch stats', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ stats: data || {} }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});