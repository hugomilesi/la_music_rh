import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface CreateScheduleRequest {
  survey_id: string;
  name: string;
  description?: string;
  target_users: string[];
  schedule_type: 'immediate' | 'scheduled' | 'recurring';
  scheduled_date?: string;
  recurrence_pattern?: string;
}

interface SendMessageRequest {
  schedule_id: string;
  user_ids?: string[];
}

interface WebhookRequest {
  event: string;
  data: {
    key?: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
    messageTimestamp?: number;
    status?: string;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    console.log(`WhatsApp NPS API - ${method} ${path}`);
    console.log(`Full URL: ${req.url}`);
    console.log(`Path starts with /nps/: ${path.startsWith('/nps/')}`);
    
    // Debug: log all path conditions
    if (path.startsWith('/nps/') && method === 'GET') {
      console.log('Matched NPS route condition');
    } else {
      console.log('Did not match NPS route condition');
    }

    // Route: POST /schedules - Criar agendamento
    if (path === '/schedules' && method === 'POST') {
      const body: CreateScheduleRequest = await req.json();
      
      // Validar dados obrigatórios
      if (!body.survey_id || !body.name || !body.target_users?.length) {
        return new Response(
          JSON.stringify({ error: 'survey_id, name e target_users são obrigatórios' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Verificar se a pesquisa existe
      const { data: survey, error: surveyError } = await supabase
        .from('nps_surveys')
        .select('id, title')
        .eq('id', body.survey_id)
        .single();

      if (surveyError || !survey) {
        return new Response(
          JSON.stringify({ error: 'Pesquisa NPS não encontrada' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Calcular next_run_at baseado no tipo de agendamento
      let nextRunAt = new Date();
      if (body.schedule_type === 'scheduled' && body.scheduled_date) {
        nextRunAt = new Date(body.scheduled_date);
      }

      // Criar agendamento
      const { data: schedule, error: scheduleError } = await supabase
        .from('message_schedules')
        .insert({
          type: 'nps',
          title: body.name,
          description: body.description,
          content: {
            survey_id: body.survey_id
          },
          target_filters: body.target_users,
          schedule_type: body.schedule_type,
          scheduled_at: body.scheduled_date,
          recurring_pattern: body.recurrence_pattern,
          status: 'active',
          next_execution_at: nextRunAt.toISOString(),
          created_by: 'f989bd1a-cc43-4e3e-8d0f-bad13fe791b1' // TODO: pegar do token de auth
        })
        .select()
        .single();

      if (scheduleError) {
        console.error('Erro ao criar agendamento:', scheduleError);
        return new Response(
          JSON.stringify({ error: 'Erro ao criar agendamento', details: scheduleError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, schedule }),
        { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Route: POST /send - Enviar mensagens
    if (path === '/send' && method === 'POST') {
      const body: SendMessageRequest = await req.json();
      
      if (!body.schedule_id) {
        return new Response(
          JSON.stringify({ error: 'schedule_id é obrigatório' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Buscar agendamento
      const { data: schedule, error: scheduleError } = await supabase
        .from('message_schedules')
        .select(`
          *
        `)
        .eq('type', 'nps')
        .eq('id', body.schedule_id)
        .single();

      if (scheduleError || !schedule) {
        return new Response(
          JSON.stringify({ error: 'Agendamento não encontrado' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Determinar usuários alvo
      let targetUserIds = body.user_ids || schedule.target_users;
      if (!targetUserIds?.length) {
        return new Response(
          JSON.stringify({ error: 'Nenhum usuário alvo especificado' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Buscar dados dos usuários
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, phone')
        .in('id', targetUserIds)
        .not('phone', 'is', null);

      if (usersError) {
        console.error('Erro ao buscar usuários:', usersError);
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar usuários' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const results = [];
      const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL') || 'https://evola.latecnology.com.br';
      const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');
      const instanceName = Deno.env.get('WHATSAPP_INSTANCE_NAME') || 'la-music-rh';

      for (const user of users || []) {
        try {
          // Gerar token único para resposta
          const responseToken = crypto.randomUUID();
          const responseUrl = `https://dzmatfnltgtgjvbputtb.supabase.co/functions/v1/whatsapp-nps/nps/${responseToken}`;

          // Criar mensagem personalizada
          const message = `Olá ${user.full_name}! 👋\n\n` +
            `Gostaríamos de saber sua opinião sobre ${schedule.nps_surveys.title}.\n\n` +
            `${schedule.nps_surveys.description || ''}\n\n` +
            `Em uma escala de 0 a 10, o quanto você recomendaria nossos serviços?\n\n` +
            `Responda clicando no link: ${responseUrl}\n\n` +
            `Sua opinião é muito importante para nós! 🙏`;

          // Registrar envio no banco
          const { data: whatsappSend, error: sendError } = await supabase
            .from('whatsapp_sends')
            .insert({
              schedule_id: body.schedule_id,
              survey_id: schedule.survey_id,
              user_id: user.id,
              phone_number: user.phone,
              status: 'pending',
              response_token: responseToken,
              response_url: responseUrl,
              metadata: { message_content: message }
            })
            .select()
            .single();

          if (sendError) {
            console.error('Erro ao registrar envio:', sendError);
            results.push({
              user_id: user.id,
              success: false,
              error: 'Erro ao registrar envio'
            });
            continue;
          }

          // Enviar via Evolution API
          if (evolutionApiKey) {
            try {
              const response = await fetch(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': evolutionApiKey
                },
                body: JSON.stringify({
                  number: user.phone,
                  text: message
                })
              });

              const result = await response.json();
              
              if (response.ok && result.key?.id) {
                // Atualizar com ID da mensagem
                await supabase
                  .from('whatsapp_sends')
                  .update({
                    message_id: result.key.id,
                    status: 'sent',
                    sent_at: new Date().toISOString()
                  })
                  .eq('id', whatsappSend.id);

                results.push({
                  user_id: user.id,
                  success: true,
                  message_id: result.key.id
                });
              } else {
                throw new Error(result.message || 'Erro no envio');
              }
            } catch (apiError) {
              console.error('Erro na Evolution API:', apiError);
              
              // Atualizar status de erro
              await supabase
                .from('whatsapp_sends')
                .update({
                  status: 'failed',
                  error_message: apiError.message
                })
                .eq('id', whatsappSend.id);

              results.push({
                user_id: user.id,
                success: false,
                error: apiError.message
              });
            }
          } else {
            // Modo de teste - marcar como enviado
            await supabase
              .from('whatsapp_sends')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', whatsappSend.id);

            results.push({
              user_id: user.id,
              success: true,
              message_id: 'test-mode'
            });
          }
        } catch (error) {
          console.error(`Erro ao processar usuário ${user.id}:`, error);
          results.push({
            user_id: user.id,
            success: false,
            error: error.message
          });
        }
      }

      // Atualizar estatísticas do agendamento
      const successCount = results.filter(r => r.success).length;
      await supabase
        .from('message_schedules')
        .update({
          success_count: (schedule.success_count || 0) + successCount,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', body.schedule_id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          results,
          summary: {
            total: results.length,
            sent: successCount,
            failed: results.length - successCount
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Route: POST /webhook - Webhook para status de mensagens
    if (path === '/webhook' && method === 'POST') {
      const body: WebhookRequest = await req.json();
      
      console.log('Webhook recebido:', JSON.stringify(body, null, 2));

      if (body.event === 'messages.update' && body.data?.key?.id) {
        const messageId = body.data.key.id;
        const status = body.data.status;

        // Atualizar status da mensagem
        const { error } = await supabase
          .from('whatsapp_sends')
          .update({
            status: status === 'READ' ? 'read' : status === 'delivered' ? 'delivered' : 'sent',
            delivered_at: status === 'delivered' ? new Date().toISOString() : undefined,
            read_at: status === 'read' ? new Date().toISOString() : undefined
          })
          .eq('message_id', messageId);

        if (error) {
          console.error('Erro ao atualizar status:', error);
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Route: GET /nps/<token> - Página de resposta NPS (formato simplificado)
    if (path.startsWith('/nps/') && method === 'GET') {
      const token = path.split('/nps/')[1];
      
      if (!token) {
        return new Response(
          'Token inválido',
          { status: 400, headers: { 'Content-Type': 'text/plain', ...corsHeaders } }
        );
      }

      // Validar token usando a função de validação
      const { data: validation, error: validationError } = await supabase
        .rpc('validate_simple_nps_token', { token_param: token })
        .single();

      if (validationError || !validation || !validation.is_valid) {
        return new Response(
          'Token inválido ou expirado',
          { status: 400, headers: { 'Content-Type': 'text/plain', ...corsHeaders } }
        );
      }

      const sendData = validation.send_data;

      // Retornar página HTML simples para resposta NPS
      const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Avaliação NPS</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .nps-form { text-align: center; }
            .score-buttons { display: flex; justify-content: center; gap: 10px; margin: 20px 0; }
            .score-btn { padding: 10px 15px; border: 1px solid #ccc; background: white; cursor: pointer; }
            .score-btn.selected { background: #007bff; color: white; }
            textarea { width: 100%; height: 100px; margin: 10px 0; }
            .submit-btn { padding: 10px 20px; background: #28a745; color: white; border: none; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="nps-form">
            <h2>Como você avaliaria nossa empresa?</h2>
            <p>De 0 a 10, o quanto você recomendaria nossa empresa para um amigo ou colega?</p>
            
            <div class="score-buttons">
              ${Array.from({length: 11}, (_, i) => `<button class="score-btn" onclick="selectScore(${i})">${i}</button>`).join('')}
            </div>
            
            <textarea id="comment" placeholder="Comentários adicionais (opcional)"></textarea>
            <br>
            <button class="submit-btn" onclick="submitResponse()">Enviar Avaliação</button>
          </div>
          
          <script>
            let selectedScore = null;
            
            function selectScore(score) {
              selectedScore = score;
              document.querySelectorAll('.score-btn').forEach(btn => btn.classList.remove('selected'));
              event.target.classList.add('selected');
            }
            
            async function submitResponse() {
              if (selectedScore === null) {
                alert('Por favor, selecione uma pontuação.');
                return;
              }
              
              const comment = document.getElementById('comment').value;
              
              try {
                const response = await fetch(window.location.href, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    score: selectedScore,
                    comment: comment
                  })
                });
                
                if (response.ok) {
                  document.body.innerHTML = '<div style="text-align: center; padding: 50px;"><h2>Obrigado pela sua avaliação!</h2><p>Sua resposta foi registrada com sucesso.</p></div>';
                } else {
                  alert('Erro ao enviar avaliação. Tente novamente.');
                }
              } catch (error) {
                alert('Erro ao enviar avaliação. Tente novamente.');
              }
            }
          </script>
        </body>
        </html>
      `;

      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      });
    }

    // Route: POST /nps/<token> - Processar resposta NPS com token na URL
    if (path.startsWith('/nps/') && method === 'POST') {
      const token = path.split('/nps/')[1];
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Token inválido' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const { score, comment } = await req.json();

       if (score === undefined || score === null) {
         return new Response(
           JSON.stringify({ error: 'Pontuação é obrigatória' }),
           { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
         );
       }

       if (score < 0 || score > 10) {
         return new Response(
           JSON.stringify({ error: 'Pontuação deve estar entre 0 e 10' }),
           { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
         );
       }

       // Validar token usando a função de validação
      const { data: validation, error: validationError } = await supabase
        .rpc('validate_simple_nps_token', { token_param: token })
        .single();

       if (validationError || !validation || !validation.is_valid) {
         return new Response(
           JSON.stringify({ error: 'Token inválido ou expirado' }),
           { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
         );
       }

       const sendData = validation.send_data;

       try {
         // Inserir resposta na tabela nps_responses
         const { error: insertError } = await supabase
           .from('nps_responses')
           .insert({
             survey_id: sendData.survey_id,
             user_name: sendData.user_name,
             user_phone: sendData.user_phone,
             score: score,
             comment: comment || null,
             response_date: new Date().toISOString()
           });

         if (insertError) {
           console.error('Erro ao inserir resposta NPS:', insertError);
           return new Response(
             JSON.stringify({ error: 'Erro interno do servidor' }),
             { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
           );
         }

         // Invalidar o token após uso
         await supabase
           .from('nps_tokens')
           .update({ used_at: new Date().toISOString() })
           .eq('token', token);

         return new Response(
           JSON.stringify({ success: true, message: 'Resposta registrada com sucesso' }),
           { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
         );
       } catch (error) {
         console.error('Erro ao processar resposta NPS:', error);
         return new Response(
          'Erro interno do servidor',
          { status: 500, headers: { 'Content-Type': 'text/plain', ...corsHeaders } }
        );
      }

      if (!validation.is_valid) {
        const statusCode = validation.send_data?.already_responded ? 410 : 404;
        return new Response(
          validation.error_message || 'Link inválido ou expirado',
          { status: statusCode, headers: { 'Content-Type': 'text/plain', ...corsHeaders } }
        );
      }

      const sendData = validation.send_data;

      // Se chegou até aqui, o token é válido e não foi respondido ainda

      // Gerar página de resposta
      const html = `<!DOCTYPE html>
      <html>
      <head>
        <title>${sendData.survey_title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          h2 { color: #333; margin-bottom: 10px; }
          .subtitle { color: #666; margin-bottom: 30px; }
          .score-buttons {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin: 20px 0;
          }
          .score-btn {
            padding: 15px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 10px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            transition: all 0.3s;
          }
          .score-btn:hover {
            border-color: #667eea;
            background: #f0f4ff;
          }
          .score-btn.selected {
            border-color: #667eea;
            background: #667eea;
            color: white;
          }
          .comment-section {
            margin: 20px 0;
          }
          textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            resize: vertical;
            min-height: 80px;
          }
          .submit-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
            transition: background 0.3s;
          }
          .submit-btn:hover {
            background: #5a67d8;
          }
          .submit-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          .scale-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            font-size: 12px;
            color: #666;
          }
          .success-message {
            text-align: center;
            color: #28a745;
            font-size: 18px;
            margin: 20px 0;
          }
          .error-message {
            text-align: center;
            color: #dc3545;
            font-size: 16px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${sendData.survey_title}</h2>
          <p class="subtitle">${sendData.survey_description || 'Sua opinião é muito importante para nós!'}</p>
          
          <div id="survey-form">
            <p><strong>Em uma escala de 0 a 10, o quanto você recomendaria nossos serviços?</strong></p>
            
            <div class="score-buttons">
              ${Array.from({length: 11}, (_, i) => `<button class="score-btn" onclick="selectScore(${i})">${i}</button>`).join('')}
            </div>
            
            <div class="scale-labels">
              <span>Muito improvável</span>
              <span>Muito provável</span>
            </div>
            
            <div class="comment-section">
              <label for="comment"><strong>Comentário (opcional):</strong></label>
              <textarea id="comment" placeholder="Conte-nos mais sobre sua experiência..."></textarea>
            </div>
            
            <button class="submit-btn" onclick="submitResponse()" disabled>Enviar Resposta</button>
          </div>
          
          <div id="success-message" style="display: none;">
            <div class="success-message">
              ✅ Obrigado pela sua resposta!
              <p>Sua opinião é muito valiosa para nós.</p>
            </div>
          </div>
          
          <div id="error-message" style="display: none;">
            <div class="error-message">
              ❌ Ops! Ocorreu um erro ao enviar sua resposta.
              <p>Tente novamente em alguns instantes.</p>
            </div>
          </div>
        </div>
        
        <script>
          let selectedScore = null;
          
          function selectScore(score) {
            selectedScore = score;
            
            // Remover seleção anterior
            document.querySelectorAll('.score-btn').forEach(btn => {
              btn.classList.remove('selected');
            });
            
            // Adicionar seleção atual
            document.querySelector('[data-score="' + score + '"]').classList.add('selected');
            
            // Habilitar botão de envio
            document.querySelector('.submit-btn').disabled = false;
          }
          
          async function submitResponse() {
            if (selectedScore === null) {
              alert('Por favor, selecione uma pontuação.');
              return;
            }
            
            const comment = document.getElementById('comment').value;
            const submitBtn = document.querySelector('.submit-btn');
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            try {
              const response = await fetch(window.location.pathname + '/submit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  token: '${token}',
                  score: selectedScore,
                  comment: comment
                })
              });
              
              if (response.ok) {
                document.getElementById('survey-form').style.display = 'none';
                document.getElementById('success-message').style.display = 'block';
              } else {
                throw new Error('Erro ao enviar resposta');
              }
            } catch (error) {
              console.error('Erro:', error);
              document.getElementById('error-message').style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Enviar Resposta';
            }
          }
        </script>
      </body>
      </html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      });
    }

    // Route: GET /response - Página de resposta NPS (formato antigo)
    if (path === '/response' && method === 'GET') {
      const token = url.searchParams.get('token');
      const question = url.searchParams.get('question'); // Nova: pergunta via URL
      
      if (!token) {
        return new Response(
          'Token inválido',
          { status: 400, headers: { 'Content-Type': 'text/plain', ...corsHeaders } }
        );
      }

      // Validar token usando a função de validação
      const { data: validation, error: validationError } = await supabase
        .rpc('validate_simple_nps_token', { token_param: token })
        .single();

      if (validationError || !validation) {
        return new Response(
          'Erro interno do servidor',
          { status: 500, headers: { 'Content-Type': 'text/plain', ...corsHeaders } }
        );
      }

      if (!validation.is_valid) {
        const statusCode = validation.send_data?.already_responded ? 410 : 404;
        return new Response(
          validation.error_message || 'Link inválido ou expirado',
          { status: statusCode, headers: { 'Content-Type': 'text/plain', ...corsHeaders } }
        );
      }

      const sendData = validation.send_data;

      // Se chegou até aqui, o token é válido e não foi respondido ainda

      // Gerar página de resposta
      const html = `<!DOCTYPE html>
      <html>
      <head>
        <title>${sendData.survey_title}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          h2 { color: #333; margin-bottom: 10px; }
          .subtitle { color: #666; margin-bottom: 30px; }
          .score-buttons {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin: 20px 0;
          }
          .score-btn {
            padding: 15px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 10px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            transition: all 0.3s;
          }
          .score-btn:hover {
            border-color: #667eea;
            background: #f0f4ff;
          }
          .score-btn.selected {
            background: #667eea;
            color: white;
            border-color: #667eea;
          }
          .labels {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #666;
            margin-bottom: 20px;
          }
          textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            resize: vertical;
            min-height: 80px;
          }
          .submit-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            margin-top: 20px;
            transition: background 0.3s;
          }
          .submit-btn:hover {
            background: #5a6fd8;
          }
          .submit-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${sendData.survey_title}</h2>
          <p class="subtitle">Olá ${sendData.user_name}!</p>
          <p>${question || sendData.survey_question || sendData.survey_description || 'Em uma escala de 0 a 10, o quanto você recomendaria nossos serviços?'}</p>
          
          <form id="npsForm">
            <div class="score-buttons">
              ${Array.from({length: 11}, (_, i) => 
                `<button type="button" class="score-btn" onclick="selectScore(${i})">${i}</button>`
              ).join('')}
            </div>
            
            <div class="labels">
              <span>Não recomendaria</span>
              <span>Recomendaria totalmente</span>
            </div>
            
            <textarea 
              name="comment" 
              placeholder="Deixe um comentário (opcional)..."
            ></textarea>
            
            <button type="submit" class="submit-btn" disabled>
              Enviar Resposta
            </button>
          </form>
        </div>
        
        <script>
          let selectedScore = null;
          
          document.querySelectorAll('.score-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              document.querySelectorAll('.score-btn').forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
              selectedScore = parseInt(btn.dataset.score);
              document.querySelector('.submit-btn').disabled = false;
            });
          });
          
          document.getElementById('npsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (selectedScore === null) return;
            
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
            
            try {
              const response = await fetch('/functions/v1/whatsapp-nps/response', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  token: '${token}',
                  score: selectedScore,
                  comment: document.querySelector('textarea').value
                })
              });
              
              if (response.ok) {
                document.querySelector('.container').innerHTML = \`
                  <h2>Obrigado!</h2>
                  <p>Sua resposta foi registrada com sucesso.</p>
                  <p>Nota: <strong>\${selectedScore}/10</strong></p>
                  <p style="color: #667eea; margin-top: 30px;">💙 Sua opinião é muito importante para nós!</p>
                \`;
              } else {
                throw new Error('Erro ao enviar resposta');
              }
            } catch (error) {
              alert('Erro ao enviar resposta. Tente novamente.');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Enviar Resposta';
            }
          });
        </script>
      </body>
      </html>`;

      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      });
    }

    // Route: POST /nps/submit - Processar resposta NPS (formato simplificado)
    if (path === '/nps/submit' && method === 'POST') {
      const { token, score, comment } = await req.json();

      if (!token || score === undefined || score === null) {
        return new Response(
          JSON.stringify({ error: 'Token e pontuação são obrigatórios' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (score < 0 || score > 10) {
        return new Response(
          JSON.stringify({ error: 'Pontuação deve estar entre 0 e 10' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Validar token novamente antes de processar
      const { data: validation, error: validationError } = await supabase
        .rpc('validate_simple_nps_token', { token_param: token })
        .single();

      if (validationError || !validation || !validation.is_valid) {
        return new Response(
          JSON.stringify({ error: 'Token inválido ou expirado' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const sendData = validation.send_data;

      try {
        // Inserir resposta na tabela nps_responses
        const { error: insertError } = await supabase
          .from('nps_responses')
          .insert({
            survey_id: sendData.survey_id,
            user_name: sendData.user_name,
            phone_number: sendData.phone_number,
            score: parseInt(score),
            comment: comment || null,
            response_token: token,
            whatsapp_message_id: sendData.whatsapp_message_id,
            responded_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Erro ao inserir resposta NPS:', insertError);
          return new Response(
            JSON.stringify({ error: 'Erro interno do servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // Atualizar status na tabela message_schedules
        const { error: updateError } = await supabase
          .from('message_schedules')
          .update({ 
            status: 'responded',
            updated_at: new Date().toISOString()
          })
          .eq('id', sendData.schedule_id);

        if (updateError) {
          console.error('Erro ao atualizar status do agendamento:', updateError);
          // Não retorna erro aqui pois a resposta já foi salva
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Resposta registrada com sucesso' }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );

      } catch (error) {
        console.error('Erro ao processar resposta NPS:', error);
        return new Response(
          JSON.stringify({ error: 'Erro interno do servidor' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    // Route: POST /response - Processar resposta NPS (formato antigo)
    if (path === '/response' && method === 'POST') {
      const body = await req.json();
      const { token, score, comment } = body;
      
      if (!token || score === undefined) {
        return new Response(
          JSON.stringify({ error: 'Token e score são obrigatórios' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Validar token antes de processar resposta
      const { data: validation, error: validationError } = await supabase
        .rpc('validate_nps_response_token', { token_param: token })
        .single();

      if (validationError || !validation || !validation.is_valid) {
        return new Response(
          JSON.stringify({ error: validation?.error_message || 'Token inválido ou expirado' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Atualizar envio com a resposta
      const { data: send, error: updateError } = await supabase
        .from('whatsapp_sends')
        .update({
          response_score: score,
          response_comment: comment,
          responded_at: new Date().toISOString()
        })
        .eq('response_token', token)
        .select()
        .single();

      if (updateError || !send) {
        return new Response(
          JSON.stringify({ error: 'Erro ao salvar resposta' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Atualizar estatísticas do agendamento
      await supabase
        .from('message_schedules')
        .update({
          success_count: supabase.rpc('increment_total_responses', { schedule_id: send.schedule_id })
        })
        .eq('id', send.schedule_id);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Route: GET /schedules - Listar agendamentos
    if (path === '/schedules' && method === 'GET') {
      const { data: schedules, error } = await supabase
        .from('message_schedules')
        .select(`
          *
        `)
        .eq('type', 'nps')
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar agendamentos' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ schedules }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Route: GET /stats - Estatísticas de envio
    if (path === '/stats' && method === 'GET') {
      const { data: stats, error } = await supabase
        .rpc('get_whatsapp_send_stats');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar estatísticas' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ stats: stats[0] || { total_sent: 0, total_delivered: 0, total_failed: 0, success_rate: 0 } }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Route não encontrada
    return new Response(
      JSON.stringify({ error: 'Endpoint não encontrado' }),
      { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('Erro na função WhatsApp NPS:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});