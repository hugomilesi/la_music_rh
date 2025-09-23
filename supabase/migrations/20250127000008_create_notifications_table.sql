-- Criar tabela 'notifications' para sistema de notificações
-- Esta tabela é necessária para o NotificationContext funcionar corretamente

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'system')),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category TEXT DEFAULT 'general',
    action_url TEXT, -- URL para ação relacionada à notificação
    metadata JSONB DEFAULT '{}', -- Dados adicionais da notificação
    expires_at TIMESTAMPTZ, -- Data de expiração da notificação
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentário da tabela
COMMENT ON TABLE public.notifications IS 'Sistema de notificações para usuários';

-- Comentários das colunas
COMMENT ON COLUMN public.notifications.title IS 'Título da notificação';
COMMENT ON COLUMN public.notifications.message IS 'Conteúdo da notificação';
COMMENT ON COLUMN public.notifications.type IS 'Tipo da notificação: info, success, warning, error, system';
COMMENT ON COLUMN public.notifications.user_id IS 'Usuário destinatário da notificação';
COMMENT ON COLUMN public.notifications.read IS 'Status de leitura da notificação';
COMMENT ON COLUMN public.notifications.priority IS 'Prioridade da notificação';
COMMENT ON COLUMN public.notifications.category IS 'Categoria da notificação (ex: rh, sistema, avaliacao)';
COMMENT ON COLUMN public.notifications.action_url IS 'URL para ação relacionada';
COMMENT ON COLUMN public.notifications.metadata IS 'Dados adicionais em formato JSON';
COMMENT ON COLUMN public.notifications.expires_at IS 'Data de expiração da notificação';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias notificações
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (
        user_id = (
            SELECT id FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.is_active = true
        )
    );

-- Política para usuários atualizarem suas próprias notificações (marcar como lida)
CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (
        user_id = (
            SELECT id FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.is_active = true
        )
    )
    WITH CHECK (
        user_id = (
            SELECT id FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.is_active = true
        )
    );

-- Política para super_admin e admin (acesso total)
CREATE POLICY "Super admin and admin full access on notifications"
    ON public.notifications
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role IN ('super_admin', 'admin')
            AND users.is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role IN ('super_admin', 'admin')
            AND users.is_active = true
        )
    );

-- Política para gestor_rh e gerente criarem notificações
CREATE POLICY "HR and manager can create notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_user_id = auth.uid()
            AND users.role IN ('gestor_rh', 'gerente', 'admin', 'super_admin')
            AND users.is_active = true
        )
    );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at_trigger
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Função para limpar notificações expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications
    WHERE expires_at IS NOT NULL AND expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count > 0 THEN
        INSERT INTO public.system_logs (log_level, message, details, source)
        VALUES (
            'INFO',
            'Notificações expiradas removidas',
            jsonb_build_object('deleted_count', deleted_count),
            'cleanup_expired_notifications'
        );
    END IF;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Inserir algumas notificações de exemplo para o super admin
INSERT INTO public.notifications (title, message, type, user_id, category, priority) 
SELECT 
    'Sistema Inicializado',
    'O sistema de gestão de RH foi inicializado com sucesso. Todas as tabelas foram criadas.',
    'success',
    u.id,
    'sistema',
    'normal'
FROM public.users u 
WHERE u.role = 'super_admin' 
LIMIT 1;

INSERT INTO public.notifications (title, message, type, user_id, category, priority)
SELECT 
    'Tabelas Criadas',
    'As tabelas "roles" e "notifications" foram criadas com sucesso para resolver os erros de carregamento.',
    'info',
    u.id,
    'sistema',
    'normal'
FROM public.users u 
WHERE u.role = 'super_admin' 
LIMIT 1;

-- Conceder permissões básicas
GRANT SELECT ON public.notifications TO anon;
GRANT ALL PRIVILEGES ON public.notifications TO authenticated;

-- Log da migração
INSERT INTO public.system_logs (log_level, message, details, source)
VALUES (
    'INFO',
    'Tabela notifications criada com sucesso',
    jsonb_build_object(
        'migration', '20250127000008_create_notifications_table',
        'action', 'CREATE TABLE notifications',
        'reason', 'Resolver erro 404 na busca de notificações'
    ),
    'migration'
);