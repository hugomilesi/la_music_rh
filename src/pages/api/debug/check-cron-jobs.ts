import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar jobs ativos do pg_cron
    const { data: cronJobs, error: cronError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT 
            jobid,
            schedule,
            command,
            nodename,
            nodeport,
            database,
            username,
            active,
            jobname
          FROM cron.job 
          WHERE command LIKE '%process_pending_nps_sends%' OR command LIKE '%nps%';
        `
      });

    if (cronError) {
      return res.status(500).json({ error: cronError.message });
    }

    // Verificar execuções recentes dos jobs
    const { data: recentRuns, error: runsError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT 
            jobid,
            runid,
            job_pid,
            database,
            username,
            command,
            status,
            return_message,
            start_time,
            end_time
          FROM cron.job_run_details 
          WHERE jobid = 6 AND start_time >= '2025-08-28'
          ORDER BY start_time DESC 
          LIMIT 20;
        `
      });

    if (runsError) {
      return res.status(500).json({ error: runsError.message });
    }

    return res.status(200).json({
      success: true,
      cronJobs,
      recentRuns,
      summary: {
        totalCronJobs: cronJobs?.length || 0,
        totalRecentRuns: recentRuns?.length || 0,
        lastRunTime: recentRuns?.[0]?.start_time || null
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}