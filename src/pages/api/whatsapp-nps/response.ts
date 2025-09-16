import { supabase } from '@/integrations/supabase/client';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Token é obrigatório' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Usar a nova função de validação do banco de dados
    const { data: validationResult, error: validationError } = await supabase
      .rpc('validate_simple_nps_token', { token_uuid: token });

    if (validationError) {
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!validationResult?.is_valid) {
      return new Response(
        JSON.stringify({ 
          error: validationResult?.error_message || 'Link inválido ou expirado'
        }),
        { status: validationResult?.already_responded ? 410 : 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        survey: validationResult.survey_data,
        user_name: validationResult.user_name,
        user_phone: validationResult.user_phone
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro ao buscar dados da pesquisa:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Token é obrigatório' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { score, comment } = await request.json();

    if (score === undefined || score < 0 || score > 10) {
      return new Response(
        JSON.stringify({ error: 'Score deve estar entre 0 e 10' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Usar a nova função de processamento de resposta do banco de dados
    const { data: processResult, error: processError } = await supabase
      .rpc('process_nps_response', {
        token_uuid: token,
        score: score,
        comment: comment || null
      });

    if (processError) {
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!processResult?.success) {
      return new Response(
        JSON.stringify({ 
          error: processResult?.error_message || 'Erro ao processar resposta'
        }),
        { status: processResult?.already_responded ? 410 : 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Resposta registrada com sucesso!'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}