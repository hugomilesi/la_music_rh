# N8N Workflow NPS WhatsApp - Guia Passo a Passo

## Visão Geral
Este guia detalha como configurar cada nó do workflow N8N para automatizar o envio de pesquisas NPS via WhatsApp usando tokens UUID únicos e funções do banco de dados.

## Fluxo Completo do Sistema NPS

### 1. Agendamento no Frontend
O processo inicia quando um usuário agenda uma pesquisa NPS através do frontend:

1. **Página NPS**: Usuário acessa a página de NPS e seleciona funcionários
2. **Agendamento**: Sistema cria registros na tabela `nps_surveys` com:
   - `id`: UUID da pesquisa
   - `title`: Título da pesquisa
   - `description`: Descrição
   - `created_by`: ID do usuário que criou
   - `is_active`: Status ativo
   - `created_at`: Data de criação

3. **Seleção de Funcionários**: Para cada funcionário selecionado, o sistema:
   - Cria um agendamento na tabela `message_schedules`
   - Define `message_type = 'nps'`
   - Define `scheduled_date` para quando enviar
   - Vincula ao `survey_id` criado

### 2. Processamento Automático (N8N)
O N8N executa automaticamente a cada 5 minutos e:

1. **Busca Agendamentos**: Localiza pesquisas NPS agendadas para envio
2. **Gera Tokens UUID**: Cria tokens únicos usando função `generate_nps_link_token`
3. **Cria Links**: Gera URLs personalizadas com os tokens
4. **Envia WhatsApp**: Dispara mensagens via Evolution API
5. **Atualiza Status**: Marca agendamentos como enviados

### 3. Resposta do Usuário
Quando o funcionário clica no link:

1. **Validação**: Edge Function valida o token usando `validate_simple_nps_token`
2. **Página de Resposta**: Exibe formulário NPS personalizado
3. **Processamento**: Resposta é processada via `process_nps_response`
4. **Finalização**: Token é marcado como usado

## Pré-requisitos
- N8N instalado e configurado
- Supabase configurado com as tabelas e funções necessárias
- Evolution API configurada para WhatsApp
- Edge Function `whatsapp-nps` configurada
- Funções do banco implementadas:
  - `generate_nps_link_token`
  - `validate_simple_nps_token`
  - `process_nps_response`

## Funções do Banco de Dados Implementadas

### 1. `generate_nps_link_token(user_id, user_name, question, survey_id, employee_name, phone_number)`
- **Função:** Gera token UUID único para links NPS
- **Parâmetros:** 
  - `user_id`: ID do usuário (integer)
  - `user_name`: Nome completo do usuário
  - `question`: Pergunta da pesquisa NPS
  - `survey_id`: ID da pesquisa NPS (UUID)
  - `employee_name`: Nome do funcionário (para compatibilidade)
  - `phone_number`: Número de telefone
- **Retorna:** Token UUID único
- **Uso:** Chamada pelo N8N no nó "Generate NPS Token"

### 2. `validate_simple_nps_token(token)`
- **Função:** Valida se token NPS é válido e ativo
- **Parâmetros:** `token` - Token UUID a ser validado
- **Retorna:** Dados do token se válido, null se inválido
- **Uso:** Chamada pela Edge Function `whatsapp-nps`

### 3. `process_nps_response(token, score, comment)`
- **Função:** Processa resposta NPS via token
- **Parâmetros:**
  - `token`: Token UUID da resposta
  - `score`: Nota NPS (0-10)
  - `comment`: Comentário opcional
- **Retorna:** ID da resposta criada
- **Uso:** Chamada pela Edge Function `whatsapp-nps`

## Configuração dos Nós

### 1. Nó Schedule Trigger
**Tipo:** Cron
**Função:** Executa o workflow automaticamente a cada 5 minutos para processar agendamentos NPS

**Configurações:**
- **Mode:** Every 5 minutes
- **Cron Expression:** `*/5 * * * *`
- **Timezone:** America/Sao_Paulo (ajustar conforme necessário)

**Detalhes de Implementação:**
1. Clique em "Add node" → "Trigger" → "Cron"
2. Configure o intervalo para 5 minutos
3. Ative o trigger para execução automática
4. Salve e ative o workflow

### 2. Nó Get Pending NPS Schedules
**Tipo:** Supabase
**Função:** Busca agendamentos NPS pendentes que precisam ser enviados

**Configurações:**
- **Operation:** Execute SQL
- **SQL Query:**
```sql
SELECT 
  ms.id,
  ms.id as schedule_id,
  ms.survey_id,
  ms.scheduled_date,
  ms.phone_number,
  jsonb_extract_path_text(ms.content, 'user_name') as user_name,
  ms.execution_stats,
  ns.title as survey_title,
  ns.description as survey_description,
  ns.question as survey_question
FROM message_schedules ms
JOIN nps_surveys ns ON ms.survey_id = ns.id
WHERE ms.message_type = 'nps'
  AND ms.scheduled_date <= NOW()
  AND (ms.execution_stats->>'status' IS NULL 
       OR ms.execution_stats->>'status' != 'sent')
  AND ns.is_active = true
  AND (ms.execution_stats->>'attempts' IS NULL 
       OR (ms.execution_stats->>'attempts')::int < 3)
ORDER BY ms.scheduled_date ASC
LIMIT 50;
```

**Detalhes de Implementação:**
1. Adicione nó "Supabase" após o Schedule Trigger
2. Configure a conexão com Supabase usando as credenciais do projeto
3. Selecione "Execute SQL" como operação
4. Cole a query SQL acima
5. A query busca apenas agendamentos que:
   - São do tipo 'nps'
   - Estão agendados para agora ou antes
   - Não foram enviados com sucesso
   - Pertencem a pesquisas ativas
   - Tiveram menos de 3 tentativas de envio

**Parâmetros:**
- **Project ID:** `dzmatfnltgtgjvbputtb`
- **Service Role Key:** (usar variável de ambiente)

### 3. Nó Check If Has Schedules
**Tipo:** IF
**Função:** Verifica se existem agendamentos para processar

**Configurações:**
- **Condition:** `{{ $json.length > 0 }}`
- **Continue On Fail:** false

### 4. Nó Split In Batches
**Tipo:** Split In Batches
**Função:** Processa os agendamentos um por vez

**Configurações:**
- **Batch Size:** 1
- **Options:** Reset

### 5. Nó Generate NPS Token
**Tipo:** Supabase
**Função:** Gera token UUID único usando a função do banco de dados e cria URL personalizada

**Configurações:**
- **Operation:** Execute SQL
- **SQL Query:**
```sql
SELECT 
  generate_nps_link_token(
    {{ $json.user_id }},
    '{{ $json.user_name }}',
    '{{ $json.survey_question }}',
    {{ $json.survey_id }},
    '{{ $json.user_name }}',
    '{{ $json.phone_number }}'
  ) as nps_token;
```

**Detalhes de Implementação:**
1. Adicione nó "Supabase" após o Split In Batches
2. Configure para "Execute SQL"
3. A função `generate_nps_link_token` retorna um token UUID único
4. Este token é automaticamente inserido na tabela `nps_tokens`
5. O token gerado será usado para criar a URL personalizada

### 5.1. Nó Create NPS URL
**Tipo:** Code
**Função:** Cria URL personalizada usando o token gerado

**Configurações:**
- **JavaScript Code:**
```javascript
const items = $input.all();

for (const item of items) {
  // Pega o token gerado pela função do banco
  const token = item.json.nps_token;
  
  // Cria URL personalizada que aponta para a Edge Function
  const npsUrl = `https://dzmatfnltgtgjvbputtb.supabase.co/functions/v1/whatsapp-nps/${token}`;
  
  // Adiciona dados necessários para os próximos nós
  item.json.nps_url = npsUrl;
  item.json.schedule_id = $('Split In Batches').item.json.id;
  item.json.user_id = $('Split In Batches').item.json.user_id;
  item.json.user_name = $('Split In Batches').item.json.user_name;
  item.json.phone_number = $('Split In Batches').item.json.phone_number;
  item.json.survey_title = $('Split In Batches').item.json.survey_title;
}

return items;
```

**Detalhes de Implementação:**
1. Adicione nó "Code" após o Generate NPS Token
2. Cole o código JavaScript acima
3. O código cria URLs que apontam diretamente para a Edge Function
4. Preserva todos os dados necessários para os próximos nós

### 6. Nó Prepare WhatsApp Message
**Tipo:** Code
**Função:** Prepara a mensagem personalizada para envio via WhatsApp

**Configurações:**
- **JavaScript Code:**
```javascript
const items = $input.all();
const results = [];

for (const item of items) {
  const data = item.json;
  
  // Mensagem personalizada com emojis e formatação
  const message = `Olá ${data.user_name}! 👋

Como parte do nosso compromisso em melhorar continuamente, gostaríamos de saber sua opinião sobre nossa empresa.

📊 *${data.survey_title}*

Por favor, avalie sua experiência conosco clicando no link abaixo:
${data.nps_url}

Sua opinião é muito importante para nós! 🙏

Obrigado,
Equipe LA Music RH`;

  results.push({
    phone_number: data.phone_number,
    message: message,
    schedule_id: data.schedule_id,
    user_id: data.user_id,
  user_name: data.user_name,
    nps_token: data.nps_token,
    nps_url: data.nps_url,
    survey_title: data.survey_title
  });
}

return results;
```

**Detalhes de Implementação:**
1. Adicione nó "Code" após o Create NPS URL
2. Cole o código JavaScript acima
3. O código cria mensagens personalizadas para cada funcionário
4. Inclui o título da pesquisa e formatação com emojis
5. Preserva todos os dados necessários para rastreamento

### 7. Nó Send WhatsApp Message
**Tipo:** HTTP Request
**Função:** Envia mensagem via Evolution API para WhatsApp

**Configurações:**
- **Method:** POST
- **URL:** `{{ $env.EVOLUTION_API_URL }}/message/sendText/{{ $env.WHATSAPP_INSTANCE }}`
- **Headers:**
  - `Content-Type`: application/json
  - `apikey`: `{{ $env.EVOLUTION_API_KEY }}`
- **Body (JSON):**
```json
{
  "number": "{{ $json.phone_number }}",
  "text": "{{ $json.message }}"
}
```

**Detalhes de Implementação:**
1. Adicione nó "HTTP Request" após o Prepare WhatsApp Message
2. Configure o método como POST
3. Use as variáveis de ambiente para URL e API key
4. O corpo da requisição deve incluir o número e a mensagem
5. A Evolution API retornará um ID da mensagem se bem-sucedida

### 8. Nó Check Send Status
**Tipo:** IF
**Função:** Verifica se o envio da mensagem foi bem-sucedido

**Configurações:**
- **Condition:** `{{ $json.status === 'success' || $json.message?.key?.id }}`

**Detalhes de Implementação:**
1. Adicione nó "IF" após o Send WhatsApp Message
2. Configure a condição para verificar se há um ID de mensagem
3. Conecte a saída "true" para atualização de sucesso
4. Conecte a saída "false" para tratamento de erro

### 9. Nó Update Success Stats
**Tipo:** Supabase
**Função:** Atualiza estatísticas de execução em caso de sucesso no envio

**Configurações:**
- **Operation:** Execute SQL
- **SQL Query:**
```sql
UPDATE message_schedules 
SET execution_stats = jsonb_build_object(
  'status', 'sent',
  'sent_at', NOW()::text,
  'attempts', COALESCE((execution_stats->>'attempts')::int, 0) + 1,
  'whatsapp_message_id', '{{ $json.message.key.id }}',
  'last_attempt_at', NOW()::text
)
WHERE id = {{ $('Prepare WhatsApp Message').item.json.schedule_id }};
```

**Detalhes de Implementação:**
1. Adicione nó "Supabase" conectado à saída "true" do Check Send Status
2. Configure para "Execute SQL"
3. A query atualiza o status para 'sent' e registra o ID da mensagem
4. Incrementa o contador de tentativas
5. Registra timestamps de envio e última tentativa

### 10. Nó Update NPS Token Status
**Tipo:** Supabase
**Função:** Atualiza o status do token NPS para 'sent' após envio bem-sucedido

**Configurações:**
- **Operation:** Execute SQL
- **SQL Query:**
```sql
UPDATE nps_tokens 
SET 
  whatsapp_message_id = '{{ $json.message.key.id }}',
  sent_at = NOW()
WHERE token = '{{ $('Prepare WhatsApp Message').item.json.nps_token }}';
```

**Detalhes de Implementação:**
1. Adicione nó "Supabase" após o Update Success Stats
2. Configure para "Execute SQL"
3. A query atualiza o token com o ID da mensagem WhatsApp
4. Registra quando a mensagem foi enviada
5. Mantém o token ativo para permitir resposta

### 11. Nó Update Error Stats
**Tipo:** Supabase
**Função:** Atualiza estatísticas em caso de erro no envio da mensagem

**Configurações:**
- **Operation:** Execute SQL
- **SQL Query:**
```sql
UPDATE message_schedules 
SET execution_stats = jsonb_build_object(
  'status', 'error',
  'error_message', '{{ $json.error || "Erro no envio da mensagem WhatsApp" }}',
  'attempts', COALESCE((execution_stats->>'attempts')::int, 0) + 1,
  'last_attempt_at', NOW()::text,
  'last_error_at', NOW()::text
)
WHERE id = {{ $('Prepare WhatsApp Message').item.json.schedule_id }};
```

**Detalhes de Implementação:**
1. Adicione nó "Supabase" conectado à saída "false" do Check Send Status
2. Configure para "Execute SQL"
3. A query registra o erro e incrementa tentativas
4. Registra timestamps de erro e última tentativa
5. Permite nova tentativa em execuções futuras (até 3 tentativas)

## Fluxo de Conexões Detalhado

### Conexões Principais:
1. **Schedule Trigger** → **Get Pending NPS Schedules**
2. **Get Pending NPS Schedules** → **Check If Has Schedules**
3. **Check If Has Schedules** (True) → **Split In Batches**
4. **Split In Batches** → **Generate NPS Token**
5. **Generate NPS Token** → **Create NPS URL**
6. **Create NPS URL** → **Prepare WhatsApp Message**
7. **Prepare WhatsApp Message** → **Send WhatsApp Message**
8. **Send WhatsApp Message** → **Check Send Status**

### Conexões de Sucesso:
9. **Check Send Status** (True) → **Update Success Stats**
10. **Update Success Stats** → **Update NPS Token Status**

### Conexões de Erro:
11. **Check Send Status** (False) → **Update Error Stats**

### Loop de Processamento:
12. **Split In Batches** (loop) → volta para **Generate NPS Token** (processa próximo funcionário)

### Fluxo Sem Agendamentos:
13. **Check If Has Schedules** (False) → **Workflow termina** (nada para processar)

## Variáveis de Ambiente Necessárias

### No N8N:
```env
# Supabase
SUPABASE_PROJECT_ID=dzmatfnltgtgjvbputtb
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bWF0Zm5sdGd0Z2p2YnB1dHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDYzMDE5MiwiZXhwIjoyMDY2MjA2MTkyfQ.CcTHb0QXiAPY0tq_QCejzjafEhKXQYCLFZbCxxXN_Do

# Evolution API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-api-key
WHATSAPP_INSTANCE=sua-instancia

# URLs Base
SUPABASE_URL=https://dzmatfnltgtgjvbputtb.supabase.co
```

### Configuração das Variáveis no N8N:
1. Acesse **Settings** → **Environments**
2. Adicione cada variável individualmente
3. Use `{{ $env.VARIABLE_NAME }}` nos nós para referenciar
4. Teste as conexões antes de ativar o workflow

## Arquitetura de URLs

### URLs Geradas:
- **Formato:** `https://dzmatfnltgtgjvbputtb.supabase.co/functions/v1/whatsapp-nps/{token}`
- **Exemplo:** `https://dzmatfnltgtgjvbputtb.supabase.co/functions/v1/whatsapp-nps/d6865232-1729-4273-b665-1843dcc9e67d`

### Vantagens desta Arquitetura:
1. **URLs Diretas:** Apontam diretamente para a Edge Function
2. **Sem Proxy:** Não necessita configuração de proxy local
3. **HTTPS Nativo:** URLs seguras por padrão
4. **Escalabilidade:** Supabase gerencia a infraestrutura
5. **Logs Centralizados:** Todos os acessos ficam nos logs do Supabase

## Monitoramento e Logs

### Queries para Monitoramento:

```sql
-- Verificar agendamentos pendentes
SELECT 
  ms.*,
  jsonb_extract_path_text(ms.content, 'user_name') as user_name,
  ms.phone_number
FROM message_schedules ms
WHERE (ms.execution_stats->>'status' IS NULL 
       OR ms.execution_stats->>'status' != 'sent')
AND ms.scheduled_date <= NOW()
ORDER BY ms.scheduled_date;

-- Verificar estatísticas de execução por período
SELECT 
  DATE(created_at) as date,
  execution_stats->>'status' as status,
  COUNT(*) as total,
  AVG((execution_stats->>'attempts')::int) as avg_attempts
FROM message_schedules 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), execution_stats->>'status'
ORDER BY date DESC;

-- Verificar tokens NPS e suas respostas
SELECT 
  nt.created_at::date as date,
  COUNT(*) as tokens_generated,
  COUNT(CASE WHEN nt.is_active = false THEN 1 END) as tokens_used,
  COUNT(nr.id) as responses_received,
  ROUND(AVG(nr.score), 2) as avg_nps_score
FROM nps_tokens nt
LEFT JOIN nps_responses nr ON nr.response_token = nt.token
WHERE nt.created_at >= NOW() - INTERVAL '30 days'
GROUP BY nt.created_at::date
ORDER BY date DESC;

-- Performance do sistema
SELECT 
  'message_schedules' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN execution_stats->>'status' = 'sent' THEN 1 END) as ativos,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as criados_hoje
FROM message_schedules
UNION ALL
SELECT 
  'nps_tokens' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_active = true THEN 1 END) as ativos,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as criados_hoje
FROM nps_tokens
UNION ALL
SELECT 
  'nps_responses' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN score >= 9 THEN 1 END) as promotores,
  COUNT(CASE WHEN response_date >= NOW() - INTERVAL '24 hours' THEN 1 END) as respostas_hoje
FROM nps_responses;
```

### Logs do N8N:
- Acesse **Executions** para ver histórico de execuções
- Filtre por status (success, error, waiting)
- Analise logs detalhados de cada nó
- Configure alertas para falhas recorrentes

### Logs do Supabase:
- Use `get_logs` para verificar logs da Edge Function
- Monitore logs de autenticação e database
- Configure alertas para erros críticos

## Troubleshooting

### Problemas Comuns:

#### 1. Agendamentos não executam:
**Sintomas:** Workflow não dispara no horário esperado
**Soluções:**
- Verificar se o workflow está ativo
- Confirmar timezone do N8N (deve ser America/Sao_Paulo)
- Verificar expressão cron: `*/5 * * * *` (a cada 5 minutos)
- Verificar se há agendamentos pendentes na query
- Confirmar se existem pesquisas NPS ativas com agendamentos válidos

**Comandos de verificação:**
```sql
-- Verificar agendamentos NPS pendentes
SELECT 
  ms.*,
  ns.title as survey_title,
  ns.is_active as survey_active
FROM message_schedules ms
JOIN nps_surveys ns ON ms.survey_id = ns.id
WHERE ms.message_type = 'nps'
  AND ms.scheduled_date <= NOW()
  AND (ms.execution_stats->>'status' IS NULL 
       OR ms.execution_stats->>'status' != 'sent')
ORDER BY ms.scheduled_date;

-- Verificar se funcionários têm telefones válidos
SELECT 
  ms.employee_name,
  ms.phone_number,
  CASE 
    WHEN ms.phone_number IS NULL THEN 'Sem telefone'
    WHEN LENGTH(ms.phone_number) < 10 THEN 'Telefone inválido'
    ELSE 'OK'
  END as phone_status
FROM message_schedules ms
WHERE ms.message_type = 'nps'
  AND ms.scheduled_date <= NOW();
```

#### 2. Erro na geração de tokens:
**Sintomas:** Falha no nó "Generate NPS Token"
**Soluções:**
- Verificar conexão Supabase (project_id e service_role_key)
- Confirmar se função `generate_nps_link_token` existe
- Verificar permissões RLS nas tabelas `nps_tokens` e `nps_responses`
- Testar função manualmente no Supabase SQL Editor

#### 3. Erro no envio de mensagens:
**Sintomas:** Falha no nó "Send WhatsApp Message"
**Soluções:**
- Verificar status da Evolution API (endpoint `/manager/status`)
- Confirmar se instância WhatsApp está conectada
- Validar formato dos números: `5511999999999` (sem +, com DDI)
- Verificar rate limits da API
- Testar envio manual via Postman/Insomnia

#### 4. Links NPS não funcionam:
**Sintomas:** Usuário clica no link mas não carrega
**Soluções:**
- Verificar se Edge Function `whatsapp-nps` está deployada
- Confirmar se token existe: `SELECT * FROM nps_tokens WHERE token = 'xxx'`
- Verificar logs da Edge Function no Supabase
- Testar URL diretamente no navegador
- Verificar se token não expirou (is_active = true)

#### 5. Respostas não são processadas:
**Sintomas:** Usuário responde mas não aparece no sistema
**Soluções:**
- Verificar função `process_nps_response` no Supabase
- Confirmar se token está válido (is_active = true, used_at IS NULL)
- Verificar logs da Edge Function
- Testar função manualmente com dados de exemplo

### Comandos de Debug:

```sql
-- Verificar último erro de execução
SELECT 
  execution_stats->>'error_message' as error,
  execution_stats->>'last_error_at' as error_time,
  *
FROM message_schedules 
WHERE execution_stats->>'status' = 'error'
ORDER BY (execution_stats->>'last_error_at')::timestamp DESC
LIMIT 5;

-- Verificar tokens problemáticos
SELECT 
  token,
  created_at,
  is_active,
  used_at,
  user_name,
  user_phone
FROM nps_tokens 
WHERE created_at >= NOW() - INTERVAL '1 day'
AND is_active = true
AND used_at IS NULL
ORDER BY created_at DESC;

-- Verificar respostas recentes
SELECT 
  nr.*,
  nt.user_name,
  nt.user_phone
FROM nps_responses nr
JOIN nps_tokens nt ON nt.token = nr.response_token
WHERE nr.response_date >= NOW() - INTERVAL '1 day'
ORDER BY nr.response_date DESC;

-- Debug: Verificar dados completos de um agendamento
SELECT 
  ms.*,
  u.full_name, -- Corrigido: full_name
  u.phone,
  u.department,
  ns.title as survey_title,
  ns.question
FROM message_schedules ms
JOIN users u ON u.id = ANY( -- Corrigido: users e lógica de join
  SELECT jsonb_array_elements_text(ms.target_users)::uuid
)
JOIN nps_surveys ns ON ns.id::text = ms.content->>'survey_id' -- Corrigido: survey_id no content
WHERE ms.id = 'SCHEDULE_ID';

-- Debug: Verificar fluxo completo de um token
SELECT 
  'Token' as step,
  nt.token,
  nt.is_active::text as status, -- Corrigido: is_active
  nt.created_at
FROM nps_tokens nt
WHERE nt.token = 'TOKEN_AQUI'
UNION ALL
SELECT 
  'Response' as step,
  nr.token,
  nr.score::text,
  nr.response_date as created_at -- Corrigido: response_date
FROM nps_responses nr
WHERE nr.token = 'TOKEN_AQUI'
ORDER BY created_at;

-- Verificar tokens gerados recentemente
SELECT 
  nt.*,
  u.full_name as user_name
FROM nps_tokens nt
JOIN users u ON u.id = nt.user_id
WHERE nt.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY nt.created_at DESC;

-- Verificar se função generate_nps_link_token está funcionando
SELECT generate_nps_link_token(
  1, -- user_id
  'Nome do Usuário',
  'Pergunta da pesquisa',
  'SURVEY_ID'::uuid,
  'Nome do Usuário',
  '5511999999999'
);
```

## Benefícios da Arquitetura Simplificada

### Vantagens Técnicas:
1. **Menos Dependências:** Sem necessidade de proxy ou servidor local
2. **URLs Diretas:** Links apontam diretamente para Supabase Edge Functions
3. **HTTPS Nativo:** Segurança garantida por padrão
4. **Escalabilidade Automática:** Supabase gerencia a infraestrutura
5. **Logs Centralizados:** Todos os acessos ficam nos logs do Supabase

### Vantagens Operacionais:
1. **Automatização Completa:** Sistema totalmente automatizado via N8N
2. **Processamento em Lote:** Múltiplos funcionários processados simultaneamente
3. **Sistema de Retry:** Tentativas automáticas em caso de falha (até 3x)
4. **Rastreabilidade Total:** Logs completos de todas as operações
5. **Flexibilidade de Horários:** Fácil modificação via expressões cron

### Vantagens de Negócio:
1. **Redução de Custos:** Menos infraestrutura para manter
2. **Maior Confiabilidade:** Menos pontos de falha
3. **Facilidade de Manutenção:** Configuração centralizada no N8N
4. **Segurança Aprimorada:** Tokens únicos com expiração automática
5. **Métricas Detalhadas:** Acompanhamento completo do processo NPS

## Próximos Passos

1. **Implementar Alertas:** Configurar notificações para falhas
2. **Dashboard de Métricas:** Criar visualizações dos dados NPS
3. **Otimização de Performance:** Ajustar batch sizes conforme volume
4. **Backup e Recovery:** Implementar estratégias de backup
5. **Testes Automatizados:** Criar testes para validar o fluxo completo