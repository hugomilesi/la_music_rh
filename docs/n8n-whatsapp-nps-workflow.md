# Configuração do Workflow N8N para Envio de Pesquisas NPS via WhatsApp (Arquitetura Simplificada)

## Visão Geral

Este documento descreve a nova arquitetura simplificada do workflow N8N para processar automaticamente os envios de pesquisas NPS via WhatsApp. A refatoração eliminou a tabela `whatsapp_sends` redundante, simplificando o fluxo de dados.

## Arquitetura Simplificada

### Tabelas Principais
- **`message_schedules`**: Armazena agendamentos NPS com `execution_stats` para rastreamento
- **`nps_responses`**: Armazena respostas com campos de rastreamento WhatsApp adicionados

### Campos Adicionados em `nps_responses`
- `response_token`: Token único para identificar a resposta
- `whatsapp_message_id`: ID da mensagem no WhatsApp
- `phone_number`: Número de telefone do destinatário
- `sent_at`: Timestamp do envio

## Fluxo do Processo Simplificado

1. **Criação de Agendamento**: Frontend cria agendamento na tabela `message_schedules`
2. **N8N Monitora**: N8N verifica periodicamente por novos agendamentos usando `get_pending_nps_schedules()`
3. **Envio WhatsApp**: N8N envia mensagens diretamente via API do WhatsApp
4. **Atualização Stats**: N8N atualiza `execution_stats` usando `update_schedule_execution_stats()`
5. **Registro Resposta**: Quando usuário responde, usa `process_whatsapp_nps_response()`

## Funções Supabase Disponíveis

### 1. get_pending_nps_schedules()
**Descrição**: Busca agendamentos NPS pendentes para processamento

**Retorno**:
```sql
schedule_id uuid
title text
survey_id uuid
survey_title text
message_content text
scheduled_at timestamptz
next_execution_at timestamptz
```

**Exemplo de uso**:
```sql
SELECT * FROM get_pending_nps_schedules();
```

### 2. update_schedule_execution_stats(schedule_id, stats_data)
**Descrição**: Atualiza estatísticas de execução de um agendamento

**Parâmetros**:
- `p_schedule_id`: UUID do agendamento
- `p_stats_data`: JSONB com estatísticas (sent_count, failed_count, etc.)

**Retorno**: boolean (sucesso)

**Exemplo de uso**:
```sql
SELECT update_schedule_execution_stats(
    'uuid-do-agendamento',
    '{"sent_count": 5, "failed_count": 1, "last_execution": "2024-01-15T10:00:00Z"}'
);
```

### 3. process_whatsapp_nps_response(response_data)
**Descrição**: Registra uma resposta NPS com dados de rastreamento do WhatsApp

**Parâmetros**:
- `p_response_data`: JSONB com dados da resposta

**Retorno**: UUID da resposta criada

**Exemplo de uso**:
```sql
SELECT process_whatsapp_nps_response('{
    "response_token": "abc123",
    "score": 9,
    "comment": "Excelente serviço",
    "phone_number": "+5511999999999"
}');
```

## Arquitetura Simplificada - Funções Removidas

As seguintes funções foram **removidas** na nova arquitetura simplificada:
- ❌ `get_pending_whatsapp_sends()` - Substituída por query direta em `message_schedules`
- ❌ `update_whatsapp_send_status()` - Substituída por `update_schedule_execution_stats()`
- ❌ `process_whatsapp_webhook()` - Simplificada para update direto em `execution_stats`

### Benefícios da Simplificação
- **Menos Tabelas**: Eliminou `whatsapp_sends` redundante
- **Menos Funções**: Reduzido de 5+ funções para 3 essenciais
- **Melhor Performance**: Queries diretas são mais rápidas
- **Manutenção Simples**: Menos código para manter
- **URLs Seguras**: Links com localhost:8080 não expõem dados sensíveis

## Configuração do Workflow N8N

### Nó 1: Cron Trigger
**Tipo**: Cron
**Configuração**:
- Intervalo: A cada 5 minutos (`*/5 * * * *`)
- Timezone: America/Sao_Paulo

### Nó 2: Buscar Agendamentos Pendentes
**Tipo**: Supabase
**Configuração**:
- Operação: Execute SQL
- SQL Query: Use o conteúdo do arquivo `n8n-nps-query.sql`
- Descrição: Query que busca agendamentos NPS ativos e prontos para envio
- Retorna: schedule_id, user_id, user_name, phone_number, survey_url (com localhost:8080), message_content, response_token
- **Importante**: Os links NPS agora usam `http://localhost:8080/nps/<token>` para maior segurança

### Nó 3: Verificar se há dados
**Tipo**: IF
**Configuração**:
- Condição: `{{ $json.length > 0 }}`
- Ação: Continua se houver agendamentos para processar

### Nó 4: Processar em lotes
**Tipo**: Split In Batches
**Configuração**:
- Batch Size: 10 (processa 10 usuários por vez)
- Opções: Reset após cada execução

### Nó 5: Enviar WhatsApp
**Tipo**: HTTP Request
**Configuração**:
- Method: POST
- URL: `{{ $env.WHATSAPP_API_URL }}`
- Headers:
  - `Authorization: Bearer {{ $env.WHATSAPP_API_TOKEN }}`
  - `Content-Type: application/json`
- Body:
```json
{
  "messaging_product": "whatsapp",
  "to": "{{ $json.phone_number }}",
  "type": "text",
  "text": {
    "body": "{{ $json.message_content }}"
  }
}
```

### Nó 6: Atualizar Estatísticas
**Tipo**: Supabase
**Configuração**:
- Operação: Execute SQL
- SQL Query: Use o conteúdo do arquivo `n8n-update-stats-query.sql`
- Descrição: Atualiza as estatísticas de execução do agendamento
- Variáveis N8N:
  - `{{ $json.length }}`: Número de usuários processados
  - `{{ $json.schedule_id }}`: ID do agendamento

### Nó 7: Log Final
**Tipo**: Set
**Configuração**:
- Campos:
  - `message`: "Processamento NPS concluído"
  - `processed_count`: `{{ $json.length }}`
  - `timestamp`: `{{ new Date().toISOString() }}`

### Nó 8: Webhook (Processar Respostas NPS) - Opcional
**Tipo**: Webhook
**Configuração**:
- Method: POST
- Path: `/webhook/nps-response`
- SQL Query: Use o conteúdo do arquivo `n8n-process-response-query.sql`
- Descrição: Processa respostas NPS recebidas dos usuários

## Configuração de Webhooks (Opcional)

### Webhook para Status do WhatsApp
**Endpoint**: `/webhook/whatsapp-status`
**Method**: POST

**Nó Webhook**:
**Tipo**: Webhook
**Configuração**:
- HTTP Method: POST
- Path: `/whatsapp-status`

**Nó Processar Webhook**:
**Tipo**: Supabase
**Configuração**:
- Operação: Execute SQL
- SQL:
```sql
-- Atualiza execution_stats do agendamento com status do WhatsApp
UPDATE message_schedules 
SET execution_stats = execution_stats || 
    jsonb_build_object(
        'whatsapp_status', '{{ $json.status }}',
        'last_webhook_update', NOW()
    )
WHERE id = '{{ $json.schedule_id }}';
```

## Arquivos SQL para N8N

O sistema utiliza queries SQL diretas em vez de funções para maior flexibilidade:

### Arquivos Disponíveis
- **`n8n-nps-query.sql`**: Query principal para buscar agendamentos NPS da tabela `message_schedules`
- **`n8n-update-stats-query.sql`**: Query para atualizar estatísticas de execução
- **`n8n-process-response-query.sql`**: Query para processar respostas NPS recebidas

### Mudanças na Arquitetura
- **Tabela Unificada**: Usa `message_schedules` em vez de tabelas separadas
- **Tokens Dinâmicos**: Gera tokens SHA256 baseados em ID do agendamento, user_id e timestamp
- **Links Seguros**: URLs no formato `http://localhost:8080/nps/<token>`
- **Proxy Configurado**: Frontend redireciona `/api/nps/*` para Edge Functions do Supabase

### Como Usar
1. Copie o conteúdo do arquivo SQL correspondente
2. Cole no campo "SQL Query" do nó Supabase no n8n
3. As variáveis `{{ $json.campo }}` serão substituídas automaticamente pelo n8n

## Variáveis de Ambiente

Configure as seguintes variáveis no n8n:

```env
# Supabase
SUPABASE_URL=https://dzmatfnltgtgjvbputtb.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# WhatsApp API
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_API_TOKEN=your_whatsapp_token

# Configurações
BATCH_SIZE=10
RETRY_ATTEMPTS=3

# URLs de Desenvolvimento
LOCALHOST_URL=http://localhost:8080
```

## Monitoramento e Logs

### Logs no Supabase
Todos os processamentos são registrados na tabela `message_schedule_logs`:

```sql
SELECT * FROM message_schedule_logs 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Métricas Importantes
- Taxa de sucesso de envios
- Tempo médio de processamento
- Erros por tipo
- Volume de mensagens por hora

## Troubleshooting

### Problema: Agendamentos não são processados
**Solução**: Verificar se o cron está ativo e se há agendamentos pendentes

### Problema: Envios ficam pendentes
**Solução**: Verificar configuração da API do WhatsApp e tokens

### Problema: Duplicação de envios
**Solução**: A função `process_nps_schedule_for_n8n` já verifica duplicatas por usuário/dia

## Status dos Envios

- `pending`: Aguardando envio
- `sent`: Enviado com sucesso
- `delivered`: Entregue ao destinatário
- `read`: Lido pelo destinatário
- `failed`: Falha no envio
- `error`: Erro no processamento

## Considerações de Segurança

1. Use sempre o service key do Supabase para as funções
2. Configure rate limiting no N8N
3. Monitore logs de erro regularmente
4. Mantenha tokens do WhatsApp seguros
5. Configure alertas para falhas críticas