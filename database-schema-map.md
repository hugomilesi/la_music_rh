# Database Schema Map - LA Music RH

## Projeto Supabase
- **Project ID**: dzmatfnltgtgjvbputtb
- **Project Name**: LA Music RH
- **Schema**: public

## Tabelas Principais

### 1. message_schedules
**Descrição**: Tabela unificada para agendamento de mensagens (notificações, NPS, WhatsApp, email)
- **id** (uuid, PK): Identificador único
- **type** (varchar): Tipo de mensagem (notification, nps, whatsapp, email)
- **title** (varchar): Título da mensagem
- **description** (text): Descrição opcional
- **content** (jsonb): Conteúdo da mensagem em formato JSON flexível
- **target_users** (jsonb): Lista de usuários alvo ou critérios de seleção
- **schedule_type** (varchar): Tipo de agendamento (immediate, recurring, conditional)
- **scheduled_for** (timestamptz): Data/hora agendada
- **recurrence_pattern** (jsonb): Padrão de recorrência para agendamentos repetitivos
- **status** (varchar): Status (pending, processing, completed, failed, cancelled)
- **last_executed_at** (timestamptz): Última execução
- **next_execution_at** (timestamptz): Próxima execução
- **retry_count** (integer): Contador de tentativas
- **max_retries** (integer): Máximo de tentativas
- **execution_log** (jsonb): Log de execuções e tentativas
- **created_by** (uuid): Criado por
- **created_at** (timestamptz): Data de criação
- **updated_at** (timestamptz): Data de atualização

### 2. message_schedule_logs
**Descrição**: Logs detalhados de execução dos agendamentos
- **id** (uuid, PK): Identificador único
- **schedule_id** (uuid, FK): Referência ao agendamento
- **log_type** (varchar): Tipo de log (info, warning, error, success, system_alert)
- **message** (text): Mensagem do log
- **details** (jsonb): Detalhes adicionais
- **created_at** (timestamptz): Data de criação

### 3. system_alerts
**Descrição**: Configurações de alertas do sistema de agendamento
- **id** (uuid, PK): Identificador único
- **alert_type** (text): Tipo de alerta
- **threshold_value** (numeric): Valor limite
- **notification_channels** (jsonb): Canais de notificação
- **is_active** (boolean): Ativo/inativo
- **created_at** (timestamptz): Data de criação
- **updated_at** (timestamptz): Data de atualização

### 4. departments
**Descrição**: Departamentos da empresa
- **id** (uuid, PK): Identificador único
- **name** (text): Nome do departamento
- **description** (text): Descrição
- **manager_id** (uuid): ID do gerente
- **created_at** (timestamptz): Data de criação
- **updated_at** (timestamptz): Data de atualização
- **RLS**: Habilitado

### 5. users
**Descrição**: Usuários do sistema
- **id** (uuid, PK): Identificador único
- **username** (text): Nome de usuário
- **email** (text): Email
- **role** (text): Função (super_admin, admin, gestor_rh, gerente)
- **department_id** (uuid, FK): Departamento
- **created_at** (timestamptz): Data de criação
- **updated_at** (timestamptz): Data de atualização
- **RLS**: Habilitado

### 6. benefits
**Descrição**: Benefícios oferecidos pela empresa
- **id** (uuid, PK): Identificador único
- **name** (text): Nome do benefício
- **description** (text): Descrição
- **benefit_type_id** (uuid, FK): Tipo de benefício
- **cost** (numeric): Custo
- **employer_contribution** (numeric): Contribuição do empregador
- **employee_contribution** (numeric): Contribuição do funcionário
- **coverage_details** (jsonb): Detalhes da cobertura
- **provider** (text): Fornecedor
- **is_active** (boolean): Ativo/inativo
- **effective_date** (date): Data de início
- **expiration_date** (date): Data de expiração
- **eligibility_rules** (jsonb): Regras de elegibilidade
- **created_at** (timestamptz): Data de criação
- **updated_at** (timestamptz): Data de atualização

### 7. benefit_types
**Descrição**: Tipos de benefícios
- **id** (uuid, PK): Identificador único
- **name** (text): Nome do tipo
- **description** (text): Descrição
- **icon** (text): Ícone
- **color** (text): Cor
- **created_at** (timestamptz): Data de criação
- **updated_at** (timestamptz): Data de atualização

### 8. incidents
**Descrição**: Incidentes registrados no sistema
- **id** (uuid, PK): Identificador único
- **title** (text): Título
- **description** (text): Descrição
- **incident_type** (text): Tipo de incidente
- **severity** (text): Severidade (low, medium, high, critical)
- **status** (text): Status (open, in_progress, resolved, closed)
- **priority** (text): Prioridade
- **location** (text): Local
- **date_occurred** (timestamptz): Data de ocorrência
- **reported_by** (uuid, FK): Reportado por
- **assigned_to** (uuid, FK): Atribuído a
- **employee_id** (uuid, FK): Funcionário envolvido
- **witnesses** (text[]): Testemunhas
- **evidence_files** (text[]): Arquivos de evidência
- **actions_taken** (text): Ações tomadas
- **resolution** (text): Resolução
- **follow_up_required** (boolean): Requer acompanhamento
- **follow_up_date** (date): Data de acompanhamento
- **is_confidential** (boolean): Confidencial
- **tags** (text[]): Tags
- **metadata** (jsonb): Metadados
- **created_at** (timestamptz): Data de criação
- **updated_at** (timestamptz): Data de atualização
- **resolved_at** (timestamptz): Data de resolução
- **closed_at** (timestamptz): Data de fechamento

### 9. documents
**Descrição**: Documentos do sistema
- **id** (uuid, PK): Identificador único
- **name** (text): Nome do documento
- **description** (text): Descrição
- **file_path** (text): Caminho do arquivo
- **file_size** (bigint): Tamanho do arquivo
- **mime_type** (text): Tipo MIME
- **category** (text): Categoria
- **tags** (text[]): Tags
- **is_public** (boolean): Público
- **uploaded_by** (uuid, FK): Enviado por
- **created_at** (timestamptz): Data de criação
- **updated_at** (timestamptz): Data de atualização

### 10. payroll_entries
**Descrição**: Entradas da folha de pagamento
- **id** (uuid, PK): Identificador único
- **employee_name** (text): Nome do funcionário
- **employee_cpf** (text): CPF do funcionário
- **unit** (text): Unidade (Barra, CG EMLA, CG LAMK, etc.)
- **position** (text): Cargo
- **base_salary** (numeric): Salário base
- **overtime_hours** (numeric): Horas extras
- **overtime_amount** (numeric): Valor das horas extras
- **bonuses** (numeric): Bônus
- **deductions** (numeric): Deduções
- **gross_salary** (numeric): Salário bruto
- **inss** (numeric): INSS
- **irrf** (numeric): IRRF
- **other_deductions** (numeric): Outras deduções
- **net_salary** (numeric): Salário líquido
- **reference_month** (integer): Mês de referência
- **reference_year** (integer): Ano de referência
- **created_at** (timestamptz): Data de criação
- **updated_at** (timestamptz): Data de atualização

## Relacionamentos Principais

1. **message_schedule_logs.schedule_id** → **message_schedules.id**
2. **users.department_id** → **departments.id**
3. **benefits.benefit_type_id** → **benefit_types.id**
4. **incidents.reported_by** → **users.id**
5. **incidents.assigned_to** → **users.id**
6. **incidents.employee_id** → **users.id**
7. **documents.uploaded_by** → **users.id**

## Permissões e RLS

### Tabelas com RLS Habilitado:
- departments
- users
- benefits
- benefit_types
- incidents
- documents

### Estrutura de Permissões:
- **super_admin**: Acesso total ao sistema
- **admin**: Pode promover usuários para gestor_rh e gerente
- **gestor_rh**: Permissões dinâmicas definidas nas configurações
- **gerente**: Permissões dinâmicas definidas nas configurações

## Observações Importantes

1. **Folha de Pagamento**: Pode incluir colaboradores não cadastrados no sistema
2. **Unidades Disponíveis**: Barra, CG EMLA, CG LAMK, Professores Multi-Unidade, Recreio, Staff Rateado
3. **Campos Corrigidos**: Removidos campos duplicados e padronizados nomes de colunas
4. **Mapeamento**: Corrigidos problemas de mapeamento entre frontend e backend

## Última Atualização
Data: 2025-01-19
Versão: 1.0
Status: Atualizado após correções de mapeamento