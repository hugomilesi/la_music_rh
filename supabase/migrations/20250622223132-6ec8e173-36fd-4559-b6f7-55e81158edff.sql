
-- Criar tabela de colaboradores
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  units TEXT[] NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso (permitindo acesso total por enquanto para simplificar)
CREATE POLICY "Allow all operations on employees" 
  ON public.employees 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_employees_updated_at 
  BEFORE UPDATE ON public.employees 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados mock existentes na tabela
INSERT INTO public.employees (name, email, phone, position, department, units, start_date, status) VALUES
  ('Aline Cristina Pessanha Faria', 'aline.faria@lamusic.com', '(21) 99999-9999', 'Coordenadora', 'Coordenação', ARRAY['campo-grande', 'barra', 'recreio'], '2024-01-15', 'active'),
  ('Felipe Elias Carvalho', 'felipe.carvalho@lamusic.com', '(21) 98888-8888', 'Professor de Violão e Guitarra', 'Educação Musical', ARRAY['campo-grande'], '2024-02-01', 'active'),
  ('Luciano Nazario de Oliveira', 'luciano.oliveira@lamusic.com', '(21) 97777-7777', 'Professor de Bateria', 'Educação Musical', ARRAY['campo-grande'], '2024-01-20', 'active'),
  ('Fabio Magarinos da Silva', 'fabio.silva@lamusic.com', '(21) 96666-6666', 'Professor de Baixo', 'Educação Musical', ARRAY['campo-grande'], '2024-03-10', 'active'),
  ('Fabiana Candido de Assis Silva', 'fabiana.silva@lamusic.com', '(21) 95555-5555', 'Professora de Canto', 'Educação Musical', ARRAY['campo-grande'], '2024-02-15', 'active'),
  ('Igor Esteves Alves Baiao', 'igor.baiao@lamusic.com', '(21) 94444-4444', 'Professor de Violão e Guitarra', 'Educação Musical', ARRAY['barra'], '2024-01-30', 'active'),
  ('Luana de Menezes Vieira', 'luana.vieira@lamusic.com', '(21) 93333-3333', 'Professora de Teclado', 'Educação Musical', ARRAY['barra'], '2024-03-05', 'active'),
  ('Marcelo Vieira Soares', 'marcelo.soares@lamusic.com', '(21) 92222-2222', 'Professor de Bateria', 'Educação Musical', ARRAY['barra'], '2024-02-20', 'active'),
  ('Jessica Balbino da Silva', 'jessica.silva@lamusic.com', '(21) 91111-1111', 'Professora de Canto', 'Educação Musical', ARRAY['barra'], '2024-04-01', 'active'),
  ('Douglas Carvalho de Azevedo', 'douglas.azevedo@lamusic.com', '(21) 90000-0000', 'Professor de Violão e Guitarra', 'Educação Musical', ARRAY['recreio'], '2024-03-15', 'active'),
  ('Denilson Macedo de Araujo', 'denilson.araujo@lamusic.com', '(21) 89999-9999', 'Professor de Teclado', 'Educação Musical', ARRAY['recreio'], '2024-02-10', 'active'),
  ('Breno Elias de Carvalho', 'breno.carvalho@lamusic.com', '(21) 88888-8888', 'Professor de Bateria', 'Educação Musical', ARRAY['recreio'], '2024-01-25', 'active'),
  ('Ayla de Souza Nunes', 'ayla.nunes@lamusic.com', '(21) 87777-7777', 'Professora de Canto', 'Educação Musical', ARRAY['recreio'], '2024-03-20', 'active');

-- Habilitar realtime para a tabela employees
ALTER TABLE public.employees REPLICA IDENTITY FULL;
