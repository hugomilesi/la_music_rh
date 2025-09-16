import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar tokens de resposta NPS
    const { data: npsTokens, error: tokensError } = await supabase
      .from('nps_response_tokens')
      .select('*')
      .gte('created_at', '2025-08-28')
      .order('created_at', { ascending: false });

    if (tokensError) {
      return res.status(500).json({ error: tokensError.message });
    }

    // Verificar tokens específicos que estavam duplicados
    const testTokens = [
      '0cff5cb0600384a9b78342fb8bdbabec',
      '3a2b8f062b24479f863a51ee16ea1d1a2fc72143e2a36f74614dea48d6bd53d0',
      '3e52b4ac2241eca704c749ab7e250d7850e2390a1dba13eb9b2db34143384c1e'
    ];

    const tokenValidations = [];
    
    for (const token of testTokens) {
      try {
        const { data: validation, error: validationError } = await supabase
          .rpc('validate_nps_response_token', { token_input: token });

        if (validationError) {
          tokenValidations.push({
            token,
            error: validationError.message,
            valid: false
          });
        } else {
          tokenValidations.push({
            token,
            validation,
            valid: validation?.is_valid || false
          });
        }
      } catch (error) {
        tokenValidations.push({
          token,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          valid: false
        });
      }
    }

    // Verificar função de validação de token
    const { data: validationFunc, error: funcError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT pg_get_functiondef(oid) as definition
          FROM pg_proc 
          WHERE proname = 'validate_nps_response_token';
        `
      });

    if (funcError) {
      return res.status(500).json({ error: funcError.message });
    }



    return res.status(200).json({
      success: true,
      npsTokens,
      tokenValidations,
      validationFunction: validationFunc?.[0]?.definition || null,
      summary: {
        totalTokens: npsTokens?.length || 0,
        validTokens: tokenValidations.filter(t => t.valid).length,
        invalidTokens: tokenValidations.filter(t => !t.valid).length,
        expiredTokens: npsTokens?.filter(t => {
          const expiresAt = new Date(t.expires_at);
          return expiresAt < new Date();
        }).length || 0
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}