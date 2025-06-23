
-- Create a table to store editable content for the landing page
CREATE TABLE public.content_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default content from the current landing page
INSERT INTO public.content_sections (section_key, title, subtitle, description) VALUES
('hero', 'Gerencie sua equipe com inteligência', '', 'Sistema completo de gestão de pessoas para academias e empresas. Simplifique processos, aumente a produtividade e melhore o clima organizacional.'),
('features', 'Funcionalidades Completas', '', 'Tudo que você precisa para gerenciar sua equipe em um só lugar'),
('benefits', 'Por que escolher o LA Music RH?', '', ''),
('cta', 'Pronto para transformar a gestão da sua equipe?', '', 'Junte-se a centenas de empresas que já otimizaram seus processos de RH');

-- Enable Row Level Security
ALTER TABLE public.content_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for content sections
-- Allow everyone to read content (for public landing page)
CREATE POLICY "Anyone can view content sections" 
  ON public.content_sections 
  FOR SELECT 
  USING (true);

-- Only authenticated users with admin role can modify content
CREATE POLICY "Only admins can modify content sections" 
  ON public.content_sections 
  FOR ALL 
  USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger to update the updated_at column
CREATE TRIGGER update_content_sections_updated_at
  BEFORE UPDATE ON public.content_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
