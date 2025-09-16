import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar mensagens duplicadas por telefone
    const { data: duplicates, error: duplicatesError } = await supabase
      .from('whatsapp_sends')
      .select(`
        phone_number,
        count(*) as total_messages,
        count(distinct response_token) as unique_tokens,
        min(created_at) as first_message,
        max(created_at) as last_message
      `)
      .gte('created_at', '2025-08-28')
      .group('phone_number')
      .having('count(*)', 'gt', 1);

    if (duplicatesError) {
      return res.status(500).json({ error: duplicatesError.message });
    }

    // Verificar detalhes das mensagens duplicadas
    const { data: detailedDuplicates, error: detailedError } = await supabase
      .from('whatsapp_sends')
      .select('*')
      .eq('phone_number', '5521964171223')
      .gte('created_at', '2025-08-28')
      .order('created_at');

    if (detailedError) {
      return res.status(500).json({ error: detailedError.message });
    }

    // Verificar agendamentos relacionados
    const { data: schedules, error: schedulesError } = await supabase
      .from('message_schedules')
      .select('*')
      .gte('created_at', '2025-08-28')
      .order('created_at', { ascending: false });

    if (schedulesError) {
      return res.status(500).json({ error: schedulesError.message });
    }

    return res.status(200).json({
      success: true,
      duplicates,
      detailedDuplicates,
      schedules,
      summary: {
        totalDuplicatePhones: duplicates?.length || 0,
        totalMessagesForTestPhone: detailedDuplicates?.length || 0,
        totalSchedules: schedules?.length || 0
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}