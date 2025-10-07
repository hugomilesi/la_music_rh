-- Primeiro, vamos criar funções que não causam recursão
-- Essas funções fazem bypass das políticas RLS usando auth.users

-- Função para verificar se é admin sem recursão
CREATE OR REPLACE FUNCTION public.is_admin_user_safe(user_auth_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = user_auth_id 
    AND u.role IN ('super_admin', 'admin')
  );
$$;

-- Função para validar permissões sem recursão
CREATE OR REPLACE FUNCTION public.validate_user_permission_safe(user_auth_id uuid, module_name text, operation text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_role TEXT;
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Buscar role do usuário usando auth.users para evitar recursão
    SELECT u.role INTO user_role 
    FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = user_auth_id;
    
    -- Se não encontrar usuário, negar acesso
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Super admin e admin têm todas as permissões
    IF user_role IN ('super_admin', 'admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar permissões específicas para outros roles
    SELECT 
        CASE operation
            WHEN 'view' THEN can_view
            WHEN 'read' THEN can_view
            WHEN 'create' THEN can_create
            WHEN 'edit' THEN can_edit
            WHEN 'update' THEN can_edit
            WHEN 'delete' THEN can_delete
            ELSE FALSE
        END
    INTO has_permission
    FROM role_permissions
    WHERE role_name = user_role AND role_permissions.module_name = validate_user_permission_safe.module_name;
    
    RETURN COALESCE(has_permission, FALSE);
END;
$$;

-- Agora vamos dropar e recriar todas as políticas problemáticas usando as funções seguras

-- Políticas da tabela users
DROP POLICY IF EXISTS "super_admin_admin_full_access_v2" ON users;
DROP POLICY IF EXISTS "hr_managers_view_users_v2" ON users;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;

-- Recriar políticas da tabela users com funções seguras
CREATE POLICY "super_admin_admin_full_access_safe" ON users
FOR ALL
TO authenticated
USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "hr_managers_view_users_safe" ON users
FOR SELECT
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  validate_user_permission_safe(auth.uid(), 'users', 'view') OR
  auth_user_id = auth.uid()
);

CREATE POLICY "users_can_view_own_profile_safe" ON users
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

CREATE POLICY "users_can_update_own_profile_safe" ON users
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Políticas da tabela audit_logs
DROP POLICY IF EXISTS "audit_logs_policy" ON audit_logs;
CREATE POLICY "audit_logs_policy_safe" ON audit_logs
FOR ALL
TO authenticated
USING (is_admin_user_safe(auth.uid()));

-- Políticas da tabela documents
DROP POLICY IF EXISTS "documents_select_policy" ON documents;
DROP POLICY IF EXISTS "documents_update_policy" ON documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON documents;

CREATE POLICY "documents_select_policy_safe" ON documents
FOR SELECT
TO authenticated
USING (
  is_public = true OR 
  uploaded_by IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  ) OR 
  is_admin_user_safe(auth.uid())
);

CREATE POLICY "documents_update_policy_safe" ON documents
FOR UPDATE
TO authenticated
USING (
  uploaded_by IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  ) OR 
  is_admin_user_safe(auth.uid())
);

CREATE POLICY "documents_delete_policy_safe" ON documents
FOR DELETE
TO authenticated
USING (
  uploaded_by IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  ) OR 
  is_admin_user_safe(auth.uid())
);

-- Políticas da tabela login_logs
DROP POLICY IF EXISTS "login_logs_select_policy" ON login_logs;
CREATE POLICY "login_logs_select_policy_safe" ON login_logs
FOR SELECT
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  user_id IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

-- Políticas da tabela system_alerts
DROP POLICY IF EXISTS "system_alerts_policy" ON system_alerts;
CREATE POLICY "system_alerts_policy_safe" ON system_alerts
FOR ALL
TO authenticated
USING (is_admin_user_safe(auth.uid()));

-- Políticas da tabela system_logs
DROP POLICY IF EXISTS "system_logs_policy" ON system_logs;
CREATE POLICY "system_logs_policy_safe" ON system_logs
FOR ALL
TO authenticated
USING (is_admin_user_safe(auth.uid()));

-- Políticas das tabelas de message_schedules
DROP POLICY IF EXISTS "message_schedules_select_policy" ON message_schedules;
DROP POLICY IF EXISTS "message_schedules_update_policy" ON message_schedules;
DROP POLICY IF EXISTS "message_schedules_delete_policy" ON message_schedules;

CREATE POLICY "message_schedules_select_policy_safe" ON message_schedules
FOR SELECT
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  created_by IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  ) OR 
  target_users ? (
    SELECT (u.id)::text FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

CREATE POLICY "message_schedules_update_policy_safe" ON message_schedules
FOR UPDATE
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  created_by IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

CREATE POLICY "message_schedules_delete_policy_safe" ON message_schedules
FOR DELETE
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  created_by IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

-- Políticas da tabela message_schedule_logs
DROP POLICY IF EXISTS "message_schedule_logs_select_policy" ON message_schedule_logs;
CREATE POLICY "message_schedule_logs_select_policy_safe" ON message_schedule_logs
FOR SELECT
TO authenticated
USING (
  is_admin_user_safe(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM message_schedules ms
    WHERE ms.id = message_schedule_logs.schedule_id 
    AND ms.created_by IN (
      SELECT u.id FROM auth.users au
      JOIN users u ON u.auth_user_id = au.id
      WHERE au.id = auth.uid()
    )
  )
);

-- Atualizar todas as políticas que usam validate_user_permission para usar a versão segura
-- Benefit dependents
DROP POLICY IF EXISTS "Users can view benefit dependents based on permissions" ON benefit_dependents;
DROP POLICY IF EXISTS "Users can update benefit dependents based on permissions" ON benefit_dependents;
DROP POLICY IF EXISTS "Users can delete benefit dependents based on permissions" ON benefit_dependents;

CREATE POLICY "benefit_dependents_select_safe" ON benefit_dependents
FOR SELECT TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'read'));

CREATE POLICY "benefit_dependents_update_safe" ON benefit_dependents
FOR UPDATE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'update'));

CREATE POLICY "benefit_dependents_delete_safe" ON benefit_dependents
FOR DELETE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'delete'));

-- Benefit documents
DROP POLICY IF EXISTS "Users can view benefit documents based on permissions" ON benefit_documents;
DROP POLICY IF EXISTS "Users can update benefit documents based on permissions" ON benefit_documents;
DROP POLICY IF EXISTS "Users can delete benefit documents based on permissions" ON benefit_documents;

CREATE POLICY "benefit_documents_select_safe" ON benefit_documents
FOR SELECT TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'read'));

CREATE POLICY "benefit_documents_update_safe" ON benefit_documents
FOR UPDATE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'update'));

CREATE POLICY "benefit_documents_delete_safe" ON benefit_documents
FOR DELETE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'delete'));

-- Benefit performance goals
DROP POLICY IF EXISTS "Users can view benefit goals based on permissions" ON benefit_performance_goals;
DROP POLICY IF EXISTS "Users can update benefit goals based on permissions" ON benefit_performance_goals;
DROP POLICY IF EXISTS "Users can delete benefit goals based on permissions" ON benefit_performance_goals;

CREATE POLICY "benefit_performance_goals_select_safe" ON benefit_performance_goals
FOR SELECT TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'read'));

CREATE POLICY "benefit_performance_goals_update_safe" ON benefit_performance_goals
FOR UPDATE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'update'));

CREATE POLICY "benefit_performance_goals_delete_safe" ON benefit_performance_goals
FOR DELETE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'delete'));

-- Benefits table
DROP POLICY IF EXISTS "benefits_select_policy" ON benefits;
DROP POLICY IF EXISTS "benefits_update_policy" ON benefits;
DROP POLICY IF EXISTS "benefits_delete_policy" ON benefits;

CREATE POLICY "benefits_select_policy_safe" ON benefits
FOR SELECT TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'benefits', 'view'));

CREATE POLICY "benefits_update_policy_safe" ON benefits
FOR UPDATE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'benefits', 'edit'));

CREATE POLICY "benefits_delete_policy_safe" ON benefits
FOR DELETE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'benefits', 'delete'));

-- Employee benefits
DROP POLICY IF EXISTS "employee_benefits_select_policy" ON employee_benefits;
DROP POLICY IF EXISTS "employee_benefits_update_policy" ON employee_benefits;
DROP POLICY IF EXISTS "employee_benefits_delete_policy" ON employee_benefits;

CREATE POLICY "employee_benefits_select_policy_safe" ON employee_benefits
FOR SELECT TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'read'));

CREATE POLICY "employee_benefits_update_policy_safe" ON employee_benefits
FOR UPDATE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'update'));

CREATE POLICY "employee_benefits_delete_policy_safe" ON employee_benefits
FOR DELETE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'beneficios', 'delete'));

-- Evaluations
DROP POLICY IF EXISTS "evaluations_select_policy" ON evaluations;
DROP POLICY IF EXISTS "evaluations_update_policy" ON evaluations;
DROP POLICY IF EXISTS "evaluations_delete_policy" ON evaluations;

CREATE POLICY "evaluations_select_policy_safe" ON evaluations
FOR SELECT TO authenticated
USING (
  validate_user_permission_safe(auth.uid(), 'evaluation', 'view') OR 
  employee_id IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  ) OR 
  evaluator_id IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

CREATE POLICY "evaluations_update_policy_safe" ON evaluations
FOR UPDATE TO authenticated
USING (
  validate_user_permission_safe(auth.uid(), 'evaluation', 'edit') OR 
  evaluator_id IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

CREATE POLICY "evaluations_delete_policy_safe" ON evaluations
FOR DELETE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'evaluation', 'delete'));

-- Incidents
DROP POLICY IF EXISTS "incidents_select_policy" ON incidents;
DROP POLICY IF EXISTS "incidents_update_policy" ON incidents;
DROP POLICY IF EXISTS "incidents_delete_policy" ON incidents;

CREATE POLICY "incidents_select_policy_safe" ON incidents
FOR SELECT TO authenticated
USING (
  (validate_user_permission_safe(auth.uid(), 'support', 'view') OR 
   reported_by IN (
     SELECT u.id FROM auth.users au
     JOIN users u ON u.auth_user_id = au.id
     WHERE au.id = auth.uid()
   ) OR 
   assigned_to IN (
     SELECT u.id FROM auth.users au
     JOIN users u ON u.auth_user_id = au.id
     WHERE au.id = auth.uid()
   ) OR 
   employee_id IN (
     SELECT u.id FROM auth.users au
     JOIN users u ON u.auth_user_id = au.id
     WHERE au.id = auth.uid()
   )) AND 
  ((is_confidential = false) OR 
   is_admin_user_safe(auth.uid()) OR 
   reported_by IN (
     SELECT u.id FROM auth.users au
     JOIN users u ON u.auth_user_id = au.id
     WHERE au.id = auth.uid()
   ) OR 
   assigned_to IN (
     SELECT u.id FROM auth.users au
     JOIN users u ON u.auth_user_id = au.id
     WHERE au.id = auth.uid()
   ))
);

CREATE POLICY "incidents_update_policy_safe" ON incidents
FOR UPDATE TO authenticated
USING (
  validate_user_permission_safe(auth.uid(), 'support', 'edit') OR 
  assigned_to IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

CREATE POLICY "incidents_delete_policy_safe" ON incidents
FOR DELETE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'support', 'delete'));

-- Payroll entries
DROP POLICY IF EXISTS "payroll_entries_select_policy" ON payroll_entries;
DROP POLICY IF EXISTS "payroll_entries_update_policy" ON payroll_entries;
DROP POLICY IF EXISTS "payroll_entries_delete_policy" ON payroll_entries;

CREATE POLICY "payroll_entries_select_policy_safe" ON payroll_entries
FOR SELECT TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'payroll', 'view'));

CREATE POLICY "payroll_entries_update_policy_safe" ON payroll_entries
FOR UPDATE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'payroll', 'edit'));

CREATE POLICY "payroll_entries_delete_policy_safe" ON payroll_entries
FOR DELETE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'payroll', 'delete'));

-- Schedule events
DROP POLICY IF EXISTS "schedule_events_select_policy" ON schedule_events;
DROP POLICY IF EXISTS "schedule_events_update_policy" ON schedule_events;
DROP POLICY IF EXISTS "schedule_events_delete_policy" ON schedule_events;

CREATE POLICY "schedule_events_select_policy_safe" ON schedule_events
FOR SELECT TO authenticated
USING (
  validate_user_permission_safe(auth.uid(), 'schedule', 'view') OR 
  user_id IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

CREATE POLICY "schedule_events_update_policy_safe" ON schedule_events
FOR UPDATE TO authenticated
USING (
  validate_user_permission_safe(auth.uid(), 'schedule', 'edit') OR 
  user_id IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

CREATE POLICY "schedule_events_delete_policy_safe" ON schedule_events
FOR DELETE TO authenticated
USING (
  validate_user_permission_safe(auth.uid(), 'schedule', 'delete') OR 
  user_id IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

-- Vacation requests
DROP POLICY IF EXISTS "vacation_requests_select_policy" ON vacation_requests;
DROP POLICY IF EXISTS "vacation_requests_update_policy" ON vacation_requests;
DROP POLICY IF EXISTS "vacation_requests_delete_policy" ON vacation_requests;

CREATE POLICY "vacation_requests_select_policy_safe" ON vacation_requests
FOR SELECT TO authenticated
USING (
  validate_user_permission_safe(auth.uid(), 'vacation', 'view') OR 
  employee_id IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  ) OR 
  approved_by IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )
);

CREATE POLICY "vacation_requests_update_policy_safe" ON vacation_requests
FOR UPDATE TO authenticated
USING (
  validate_user_permission_safe(auth.uid(), 'vacation', 'edit') OR 
  ((employee_id IN (
    SELECT u.id FROM auth.users au
    JOIN users u ON u.auth_user_id = au.id
    WHERE au.id = auth.uid()
  )) AND (status = 'pending'))
);

CREATE POLICY "vacation_requests_delete_policy_safe" ON vacation_requests
FOR DELETE TO authenticated
USING (validate_user_permission_safe(auth.uid(), 'vacation', 'delete'));