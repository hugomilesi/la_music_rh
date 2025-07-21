# Documentação de Migrações do Banco de Dados

Este documento registra as principais migrações e correções aplicadas ao banco de dados do projeto.

## Migrações Recentes

### Correção do erro de violação de restrição NOT NULL na coluna 'data_admissao'

**Problema:** Erro ao criar um colaborador devido à violação da restrição NOT NULL na coluna `data_admissao`.

**Solução:**
Modificado o serviço `employeeService.ts` para copiar automaticamente o valor de `start_date` para `data_admissao` antes de inserir no banco de dados.

**Detalhes técnicos:**
- A coluna `data_admissao` tem uma restrição NOT NULL no banco de dados
- O formulário de criação de colaborador usa o campo `start_date`, mas não estava preenchendo o campo `data_admissao`
- A solução mantém a compatibilidade com o código existente sem precisar modificar o esquema do banco de dados

### 20250628000000-add-start-date-column.sql

**Problema:** Erro ao criar um colaborador devido à coluna `start_date` estar definida no código da aplicação, mas não existir no banco de dados.

**Solução:**
1. Adicionada a coluna `start_date` do tipo DATE à tabela `public.employees`
2. Copiados os dados da coluna `data_admissao` para a nova coluna `start_date` para manter a consistência dos dados

**Detalhes técnicos:**
- A aplicação estava utilizando o campo `start_date` nos componentes e serviços, mas este campo não existia no banco de dados
- O erro ocorria especificamente durante a criação de novos colaboradores
- A migração verifica se a coluna já existe antes de criá-la para evitar erros

## Outras Migrações Importantes

### 20250627000000-add-units-column.sql
Adicionada a coluna `units` à tabela `employees` para armazenar as unidades associadas a cada colaborador.

### 20250626000000-create-schedule-events-table.sql
Criada a tabela `schedule_events` para gerenciar eventos de agenda dos colaboradores.

### 20250626000001-add-schedule-events-relation.sql
Adicionada a relação entre as tabelas `schedule_events` e `employees` através de chave estrangeira.

### 20250626000000-add-position-column.sql
Adicionada a coluna `position` à tabela `employees`.

### 20250625000000-add-phone-column.sql
Adicionada a coluna `phone` à tabela `employees`.

### 20250624000000-fix-employees-schema.sql
Corrigida a discrepância no esquema da tabela `employees`, renomeando a coluna `nome` para `name` e adicionando a coluna `department`.