-- Criar tabela de incidentes se não existir
CREATE TABLE IF NOT EXISTS public.incidents (
    id SERIAL PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.users(auth_user_id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('leve', 'moderado', 'grave')),
    description TEXT NOT NULL,
    incident_date DATE NOT NULL,
    reporter_id UUID REFERENCES public.users(auth_user_id),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'resolvido', 'arquivado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para permitir todas as operações (será refinada posteriormente)
CREATE POLICY "Allow all operations on incidents" 
  ON public.incidents 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_incidents_updated_at 
  BEFORE UPDATE ON public.incidents 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para a tabela incidents
ALTER TABLE public.incidents REPLICA IDENTITY FULL;

-- Inserir dados mock para testes
INSERT INTO public.incidents (employee_id, type, severity, description, incident_date, reporter_id, status)
SELECT 
  e.auth_user_id, 
  'Atraso', 
  'leve', 
  'Chegou 30 minutos atrasado sem justificativa', 
  '2024-03-15', 
  (SELECT auth_user_id FROM public.users WHERE full_name = 'Aline Cristina Pessanha Faria' LIMIT 1), 
  'ativo'
FROM public.users e
WHERE e.full_name = 'Fabio Magarinos da Silva'
LIMIT 1;

INSERT INTO public.incidents (employee_id, type, severity, description, incident_date, reporter_id, status)
SELECT 
  e.auth_user_id, 
  'Falta Injustificada', 
  'moderado', 
  'Não compareceu ao trabalho sem comunicação prévia', 
  '2024-03-10', 
  (SELECT auth_user_id FROM public.users WHERE full_name = 'Aline Cristina Pessanha Faria' LIMIT 1), 
  'resolvido'
FROM public.users e
WHERE e.full_name = 'Luciano Nazario de Oliveira'
LIMIT 1;

INSERT INTO public.incidents (employee_id, type, severity, description, incident_date, reporter_id, status)
SELECT 
  e.auth_user_id, 
  'Comportamento Inadequado', 
  'grave', 
  'Atendimento inadequado aos alunos relatado por pais', 
  '2024-03-08', 
  (SELECT auth_user_id FROM public.users WHERE full_name = 'Aline Cristina Pessanha Faria' LIMIT 1), 
  'ativo'
FROM public.users e
WHERE e.full_name = 'Felipe Elias Carvalho'
LIMIT 1;