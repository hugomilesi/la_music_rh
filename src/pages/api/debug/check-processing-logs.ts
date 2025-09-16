import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar logs de agendamentos
    const { data: scheduleLogs, error: logsError } = await supabase
      .from('message_schedule_logs')
      .select('*')
      .gte('created_at', '2025-08-28')
      .order('created_at', { ascending: false })
      .limit(50);

    if (logsError) {
      return res.status(500).json({ error: logsError.message });
    }

    // Verificar função process_pending_nps_sends
    const { data: functionDef, error: funcError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT pg_get_functiondef(oid) as definition
          FROM pg_proc 
          WHERE proname = 'process_pending_nps_sends';
        `
      });

    if (funcError) {
      return res.status(500).json({ error: funcError.message });
    }

    // Verificar triggers na tabela whatsapp_sends
    const { data: triggers, error: triggersError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT 
            n.nspname as schema_name,
            c.relname as table_name,
            t.tgname as trigger_name,
            p.proname as function_name,
            pg_get_functiondef(p.oid) as function_definition
          FROM pg_trigger t 
          JOIN pg_class c ON t.tgrelid = c.oid 
          JOIN pg_namespace n ON c.relnamespace = n.oid 
          JOIN pg_proc p ON t.tgfoid = p.oid 
          WHERE n.nspname = 'public' 
            AND c.relname = 'whatsapp_sends' 
            AND NOT t.tgisinternal;
        `
      });

    if (triggersError) {
      return res.status(500).json({ error: triggersError.message });
    }

    return res.status(200).json({
      success: true,
      scheduleLogs,
      functionDefinition: functionDef?.[0]?.definition || null,
      triggers,
      summary: {
        totalLogs: scheduleLogs?.length || 0,
        totalTriggers: triggers?.length || 0,
        lastLogTime: scheduleLogs?.[0]?.created_at || null
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}