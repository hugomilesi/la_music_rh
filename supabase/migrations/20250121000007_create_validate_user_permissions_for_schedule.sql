-- Criar função para validar permissões de usuário para agendamentos
CREATE OR REPLACE FUNCTION validate_user_permissions_for_schedule(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    permissions_result JSON;
BEGIN
    -- Buscar dados do usuário
    SELECT u.id, u.role, u.auth_user_id, p.full_name
    INTO user_record
    FROM users u
    LEFT JOIN profiles p ON u.auth_user_id = p.id
    WHERE u.auth_user_id = user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuário não encontrado';
    END IF;
    
    -- Construir objeto de permissões baseado no role
    permissions_result := json_build_object(
        'isAdmin', user_record.role IN ('super_admin', 'admin'),
        'canManageNotifications', user_record.role IN ('super_admin', 'admin', 'gestor_rh'),
        'canViewNotifications', user_record.role IN ('super_admin', 'admin', 'gestor_rh', 'funcionario'),
        'canManageNPS', user_record.role IN ('super_admin', 'admin', 'gestor_rh'),
        'canViewNPS', user_record.role IN ('super_admin', 'admin', 'gestor_rh', 'funcionario'),
        'canManageWhatsApp', user_record.role IN ('super_admin', 'admin', 'gestor_rh'),
        'canViewWhatsApp', user_record.role IN ('super_admin', 'admin', 'gestor_rh', 'funcionario'),
        'canManageEmail', user_record.role IN ('super_admin', 'admin', 'gestor_rh'),
        'canViewEmail', user_record.role IN ('super_admin', 'admin', 'gestor_rh', 'funcionario'),
        'availableTypes', CASE 
            WHEN user_record.role IN ('super_admin', 'admin', 'gestor_rh') THEN 
                json_build_array('notification', 'nps', 'whatsapp', 'email')
            ELSE 
                json_build_array('notification')
        END
    );
    
    RETURN permissions_result;
END;
$$;