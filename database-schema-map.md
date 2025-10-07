# Database Schema Map - Sistema de Gestão RH

## Última atualização: 31/12/2024

### Estrutura Atual do Banco de Dados

#### Tabelas Principais

1. **users** - Usuários do sistema
   - Campos: id, email, role, is_active, created_at, updated_at
   - Roles: super_admin, admin, gestor_rh, gerente

2. **role_permissions** - Permissões por role
   - Campos: role, module, view, create, edit, delete
   - Módulos: benefits, beneficios, benefit_documents, evaluation

3. **benefits** - Benefícios disponíveis
   - Campos: id, name, description, type, value, is_active, created_at, updated_at

4. **evaluations** - Avaliações e Coffee Connections
   - Campos: id, employee_id, type, status, created_at, updated_at
   - Tipos: evaluation, coffee_connection

5. **schedule_events** - Eventos agendados
   - Campos: id, employee_id, event_name, event_date, location, description

#### Storage Buckets

1. **documents** - Armazenamento de documentos
   - Estrutura: benefits/{benefitId}/{timestamp}_{originalName}
   - Metadados incorporados no nome do arquivo
   - Formato: {timestamp}_{originalName}_{fileSize}_{fileType}_{uploadedBy}_{status}

#### Mudanças Recentes

- **REMOVIDA**: Tabela `benefit_documents` (31/12/2024)
  - Motivo: Redundância com o bucket storage
  - Solução: Metadados incorporados no nome do arquivo no bucket

#### Sistema de Permissões

- **super_admin**: Acesso total
- **admin**: Pode promover para gestor_rh e gerente
- **gestor_rh**: Permissões dinâmicas configuráveis
- **gerente**: Permissões dinâmicas configuráveis

#### Unidades Permitidas

- **Sistema geral**: Campo Grande, Barra, Recreio
- **Folha de pagamento**: Barra, CG EMLA, CG LAMK, Professores Multi-Unidade, Recreio, Staff Rateado

#### Observações Importantes

1. O sistema de documentos de benefícios agora usa apenas o Supabase Storage
2. Metadados são extraídos do nome do arquivo para manter compatibilidade
3. Políticas RLS removidas da tabela benefit_documents (não existe mais)
4. Sistema híbrido eliminado para reduzir complexidade