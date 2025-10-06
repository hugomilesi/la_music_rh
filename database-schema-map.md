# Database Schema Map - LA Music RH

## Última Atualização
Data: 06/01/2025
Alteração: Criação das tabelas de reconhecimento/gamificação
- Added `recognition_programs` table for gamification modalities
- Added `recognition_criteria` table for program criteria
- Added `criterion_evaluations` table for storing employee evaluations
- Created `get_employee_ranking` function for calculating employee rankings
- Configured RLS policies and indexes for all recognition tables
- Inserted initial data for "Fideliza+", "Matriculador+ LA", and "Professor+ LA" programs
- Fixed 404 error in recognition data loading

## Tabelas Principais

### 1. users
- **Descrição**: Usuários do sistema com roles hierárquicos
- **Campos principais**: id, username, email, role, department_id, position_id, unit
- **Roles**: super_admin, admin, gestor_rh, gerente
- **Unidades**: campo-grande, barra, recreio

### 2. departments
- **Descrição**: Departamentos da empresa
- **Campos principais**: id, name, description, manager_id

### 3. role_permissions
- **Descrição**: Permissões por role (gestor_rh e gerente)
- **Módulos**: dashboard, employees, payroll, benefits, vacation, evaluation, reports, settings, users, support, nps

### 4. benefits & benefit_types
- **Descrição**: Sistema de benefícios da empresa
- **Relacionamento**: benefits -> benefit_type_id -> benefit_types

### 5. payroll_entries
- **Descrição**: Folha de pagamento (pode incluir colaboradores não cadastrados)
- **Unidades especiais**: Barra, CG EMLA, CG LAMK, Professores Multi-Unidade, Recreio, Staff Rateado

### 6. incidents
- **Descrição**: Sistema de gestão de incidentes
- **Status**: open, in_progress, resolved, closed
- **Severidade**: low, medium, high, critical

## Tabelas de Reconhecimento/Gamificação (NOVO)

### 7. recognition_programs
- **Descrição**: Programas de gamificação e reconhecimento
- **Campos**: id, name, description, color, icon, total_stars, target_roles, is_active
- **Programas atuais**:
  - Fideliza+ (Farmers) - Verde #10B981
  - Matriculador+ LA (Hunters) - Azul #3B82F6  
  - Professor+ LA (Professores) - Roxo #8B5CF6

### 8. recognition_criteria
- **Descrição**: Critérios de avaliação para cada programa
- **Campos**: id, program_id, title, description, type, weight, is_required
- **Tipos**: checkbox, stars, observation
- **Relacionamento**: program_id -> recognition_programs.id

## Políticas de Segurança (RLS)
- Todas as tabelas têm RLS habilitado
- Políticas para authenticated users e service_role
- Políticas específicas para super_admin/admin em algumas tabelas

## Índices Importantes
- idx_recognition_criteria_program_id (performance para consultas de critérios)

## Observações
- Sistema de permissões dinâmico para gestor_rh e gerente
- Super_admin e admin têm acesso total
- Folha de pagamento permite colaboradores não cadastrados
- Sistema de gamificação integrado com roles de usuário