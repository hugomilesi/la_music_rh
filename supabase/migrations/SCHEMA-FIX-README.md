# Documentação de Migrações do Banco de Dados

Este documento registra as principais migrações e correções aplicadas ao banco de dados do projeto.

## Migrações Recentes

### Correção do erro de violação de restrição NOT NULL na coluna 'data_admissao'

**Problema:** Erro ao criar um colaborador devido à violação da restrição NOT NULL na coluna `data_admissao`.

**Solução:**
Migração completa da tabela `employees` e `profiles` para a nova tabela unificada `users`.

**Detalhes técnicos:**
- Consolidação das tabelas `employees` e `profiles` em uma única tabela `users`
- Atualização de todas as referências de foreign keys para usar `users(auth_user_id)`
- Migração de todas as políticas RLS e funções administrativas
- Remoção das tabelas antigas e migrações obsoletas

### 20250628000000-add-start-date-column.sql

**Problema:** Erro ao criar um colaborador devido à coluna `start_date` estar definida no código da aplicação, mas não existir no banco de dados.

**Solução:**
1. Criação da nova tabela `users` com todos os campos necessários
2. Migração de dados das tabelas `employees` e `profiles`
3. Atualização de todas as referências em outras tabelas

**Detalhes técnicos:**
- Unificação do modelo de dados para eliminar redundâncias
- Padronização das referências de usuários em todo o sistema
- Melhoria na consistência dos dados e performance das consultas

## Outras Migrações Importantes

### 20250627000000-add-units-column.sql
~~Adicionada a coluna `units` à tabela `employees` para armazenar as unidades associadas a cada colaborador.~~ (Migrado para tabela `users`)

### 20250626000000-create-schedule-events-table.sql
Criada a tabela `schedule_events` para gerenciar eventos de agenda dos colaboradores.

### 20250626000001-add-schedule-events-relation.sql
Atualizada a relação entre as tabelas `schedule_events` e `users` através de chave estrangeira.

### 20250626000000-add-position-column.sql
~~Adicionada a coluna `position` à tabela `employees`.~~ (Migrado para tabela `users`)

### 20250625000000-add-phone-column.sql
~~Adicionada a coluna `phone` à tabela `employees`.~~ (Migrado para tabela `users`)

### 20250624000000-fix-employees-schema.sql
~~Corrigida a discrepância no esquema da tabela `employees`, renomeando a coluna `nome` para `name` e adicionando a coluna `department`.~~ (Tabela `employees` removida - migrado para `users`)