# Mapa do Esquema do Banco de Dados - LA Music RH

## Tabelas do Sistema

### 1. Gestão de Usuários e Permissões
- **users** - Tabela principal de usuários
- **roles** - Definição de papéis (super_admin, admin, gestor_rh, gerente)
- **permissions** - Permissões disponíveis no sistema
- **role_permissions** - Relacionamento entre papéis e permissões
- **departments** - Departamentos da empresa
- **unidades** - Unidades organizacionais

### 2. Sistema de Benefícios
- **benefit_types** - Tipos de benefícios
- **benefits** - Benefícios disponíveis
- **employee_benefits** - Benefícios dos funcionários
- **benefit_dependents** - Dependentes dos benefícios
- **benefit_documents** - Documentos relacionados aos benefícios

### 3. Sistema de Documentos
- **documents** - Documentos dos funcionários
- **content_sections** - Seções de conteúdo

### 4. Sistema de Avaliações
- **evaluations** - Avaliações de desempenho
- **criterion_evaluations** - Avaliações por critério

### 5. Sistema de Reconhecimento
- **recognition_programs** - Programas de reconhecimento
- **recognition_criteria** - Critérios de reconhecimento
- **employee_achievements** - Conquistas dos funcionários
- **monthly_progress** - Progresso mensal

### 6. Sistema de Folha de Pagamento
- **payrolls** - Folhas de pagamento
- **folha_pagamento** - Detalhes da folha de pagamento
- **folha_rateio** - Rateio da folha de pagamento

### 7. Sistema de Férias
- **vacation_requests** - Solicitações de férias
- **vacation_balances** - Saldos de férias

### 8. Sistema de Incidentes
- **incidents** - Registro de incidentes

### 9. Sistema de Agendamento e Mensagens
- **message_schedules** - Agendamentos de mensagens (centralizador)
- **message_schedule_logs** - Logs dos agendamentos (única tabela de logs ativa)
- **schedule_events** - Eventos agendados

### 10. Sistema de WhatsApp e NPS
- **nps_surveys** - Pesquisas NPS
- **nps_responses** - Respostas das pesquisas NPS
- **whatsapp_sends** - Envios WhatsApp consolidados (antiga `nps_whatsapp_sends`)
  - Campos: `message_content`, `message_type`, `whatsapp_message_id`, `retry_count`, `error_message`
  - Tipos de mensagem: 'nps', 'legacy', 'geral', 'aviso', 'lembrete', 'aniversario'
- **message_schedules** - Agendamentos unificados (inclui WhatsApp, NPS, etc.)

### 11. Sistema de Notificações
- **notifications** - Notificações do sistema

### 12. Sistema de Auditoria e Logs
- **security_audit_log** - Log de auditoria de segurança
- **system_logs** - Logs do sistema
- **policy_backup_performance** - Backup de políticas de performance

## Funções Principais do Banco

### Funções de Permissões e Segurança
- `check_permission(user_id, permission_name)` - Verifica permissões
- `check_user_permission(user_id, permission_name)` - Verifica permissões usando auth_user_id
- `has_permission(user_id, permission_name)` - Verifica se usuário tem permissão
- `is_admin(user_id)` - Verifica se é admin
- `is_super_admin(user_id)` - Verifica se é super admin
- `can_modify_user(modifier_id, target_id)` - Verifica se pode modificar usuário
- `can_promote_to_admin(user_id)` - Verifica se pode promover para admin
- `get_user_permissions(user_id)` - Obtém permissões do usuário
- `get_role_permissions(role_name)` - Obtém permissões do papel
- `update_role_permissions(role_name, permissions)` - Atualiza permissões do papel

### Funções de Agendamento
- `create_message_schedule()` - Cria agendamento de mensagem unificado (inclui WhatsApp, NPS, etc.)
- `create_nps_schedule()` - Cria agendamento NPS (corrigida para usar auth.users.id)
- `process_message_schedules()` - Processa agendamentos
- `process_nps_schedules()` - Processa agendamentos NPS
- `calculate_next_execution()` - Calcula próxima execução
- `toggle_schedule_status()` - Alterna status do agendamento
- `can_manage_schedule_type()` - Verifica permissões para tipos de agendamento

### Funções de WhatsApp
- `send_whatsapp_message()` - Envia mensagem WhatsApp
- `get_whatsapp_send_stats()` - Obtém estatísticas de envio
- `process_whatsapp_schedule()` - Processa agendamento WhatsApp
- `process_pending_nps_sends()` - Processa envios NPS pendentes

### Funções de NPS
- `validate_nps_response_token()` - Valida token de resposta NPS
- `generate_response_token()` - Gera token de resposta
- `get_nps_schedules()` - Obtém agendamentos NPS

### Funções de Usuários
- `create_admin_user()` - Cria usuário admin
- `delete_user_by_id()` - Deleta usuário
- `promote_user_to_admin()` - Promove usuário para admin
- `sync_user_tables()` - Sincroniza tabelas de usuários
- `get_user_effective_role()` - Obtém papel efetivo do usuário

### Funções de Segurança e Auditoria
- `log_security_event()` - Registra evento de segurança
- `check_auth_security_issues()` - Verifica problemas de segurança
- `validate_password_strength()` - Valida força da senha
- `cleanup_expired_sessions_enhanced()` - Limpa sessões expiradas
- `verify_security_configuration()` - Verifica configuração de segurança

### Funções Utilitárias
- `generate_random_password()` - Gera senha aleatória
- `get_avatar_url()` - Obtém URL do avatar
- `soft_delete_record()` - Exclusão lógica
- `restore_record()` - Restaura registro
- `auto_distribute_allocation()` - Distribui alocação automaticamente

## Relacionamentos Principais

### Usuários e Permissões
- `users` ← `role_permissions` → `permissions`
- `users` ← `roles` → `role_permissions`

### Sistema de Benefícios
- `users` ← `employee_benefits` → `benefits` → `benefit_types`
- `employee_benefits` ← `benefit_dependents`
- `documents` ← `benefit_documents`

### Sistema de Avaliações
- `users` ← `evaluations` (employee_id, evaluator_id, approved_by)
- `recognition_criteria` ← `criterion_evaluations`
- `recognition_programs` ← `recognition_criteria`
- `users` ← `employee_achievements` → `recognition_programs`

### Sistema de Agendamento
- `message_schedules` ← `message_schedule_logs`
- `message_schedules` ← `whatsapp_messages`
- `message_schedules` ← `whatsapp_sends`

### Sistema NPS e WhatsApp
- `nps_surveys` ← `nps_responses` → `users`
- `nps_surveys` ← `nps_responses` → `users`
- `nps_surveys` ← `whatsapp_sends` → `users`
- `message_schedules` ← `whatsapp_sends`

### Sistema de Folha de Pagamento
- `payrolls` ← `folha_pagamento`
- `folha_pagamento` ← `folha_rateio` → `unidades`

### Sistema de Férias
- `users` ← `vacation_requests` (employee_id, approved_by)

## Triggers Ativos

- `handle_new_user` - Trigger para novos usuários
- `prevent_privilege_escalation` - Previne escalação de privilégios
- `set_response_token` - Define token de resposta
- `trigger_set_timestamp` - Define timestamp automaticamente
- `update_*_updated_at` - Atualiza campo updated_at em várias tabelas
- `check_document_status` - Verifica status do documento


## ✅ Consolidação Concluída - Tabelas WhatsApp

### Mudanças Implementadas
- **Consolidação**: `nps_whatsapp_messages` removida, `nps_whatsapp_sends` renomeada para `whatsapp_sends`
- **Limpeza**: Tabela redundante `schedule_logs` removida, mantendo apenas `message_schedule_logs`
- **Novos campos**: Adicionados `message_content`, `message_type`, `whatsapp_message_id`, `retry_count`, `error_message`
- **Migração**: 2 registros migrados de `nps_whatsapp_messages` com tipo 'legacy'
- **Funções atualizadas**: Todas as 5 funções que faziam referência às tabelas antigas foram atualizadas
- **Triggers**: Renomeados para refletir o novo nome da tabela

### Estado Atual
- **Total de registros**: 4 (2 NPS + 2 migrados)
- **Tabela única**: `whatsapp_sends` com estrutura consolidada
- **Campos opcionais**: `schedule_id`, `survey_id`, `user_id` para compatibilidade com dados legados
- **Índices otimizados**: Para `message_type`, `whatsapp_message_id`, `status`, `phone_number`, `sent_at`

### Benefícios Alcançados
- ✅ Eliminação de redundância
- ✅ Dados centralizados
- ✅ Manutenção simplificada
- ✅ Melhor performance
- ✅ Estrutura mais clara

## ✅ Correção de Agendamentos NPS - Janeiro 2025

### Problema Identificado
- Erro "Usuário não tem permissão para criar agendamentos NPS" no frontend
- Função `create_nps_schedule` com referências incorretas entre tabelas `users` e `auth.users`
- Campo `created_by` na tabela `message_schedules` referencia `auth.users.id`, não `users.id`

### Correções Implementadas
- **Função `create_nps_schedule`**: Corrigida para usar `auth_user_id` no campo `created_by`
- **Verificação de permissões**: Ajustada para usar `auth_user_id` na função `can_manage_schedule_type`
- **Mapeamento de usuários**: Implementada lógica para converter entre `users.id` e `auth.users.id`
- **Status de agendamentos**: Definido como 'active' para processamento imediato

### Validação
- ✅ Função `create_nps_schedule` testada com sucesso
- ✅ Agendamento criado com ID: `3a214518-8d1c-4a13-9a7f-43ee305b17d5`
- ✅ Status 'active' e tipo 'nps' configurados corretamente
- ✅ Campo `created_by` usando `auth_user_id` corretamente

### Estrutura de Permissões
- **Super Admin e Admin**: Acesso total (bypass de verificações específicas)
- **Outros usuários**: Verificação dinâmica baseada em `role_permissions`
- **Permissão NPS**: Requer `nps.create` para criar agendamentos NPS

---

**Última atualização**: Janeiro 2025
**Versão**: 1.1
**Status**: Correção de agendamentos NPS concluída