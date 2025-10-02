-- Criação da tabela colaboradores
-- Esta tabela armazena colaboradores que não são necessariamente usuários do sistema
-- mas precisam ser registrados para controle de folha de pagamento, férias, documentos, etc.

CREATE TABLE IF NOT EXISTS public.colaboradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    cargo VARCHAR(255) NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    data_admissao TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    unidade VARCHAR(50) NOT NULL CHECK (unidade IN ('Campo Grande', 'Barra', 'Recreio')),
    tipo_contratacao VARCHAR(50) NOT NULL CHECK (tipo_contratacao IN ('CLT', 'PJ', 'Estágiário', 'Freelancer', 'Horista')),
    banco VARCHAR(255),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    tipo_conta VARCHAR(20) CHECK (tipo_conta IN ('corrente', 'poupança')),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_colaboradores_email ON public.colaboradores(email);
CREATE INDEX IF NOT EXISTS idx_colaboradores_cpf ON public.colaboradores(cpf);
CREATE INDEX IF NOT EXISTS idx_colaboradores_unidade ON public.colaboradores(unidade);
CREATE INDEX IF NOT EXISTS idx_colaboradores_departamento ON public.colaboradores(departamento);
CREATE INDEX IF NOT EXISTS idx_colaboradores_status ON public.colaboradores(status);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_colaboradores_updated_at
    BEFORE UPDATE ON public.colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.colaboradores IS 'Tabela de colaboradores - não são usuários do sistema, apenas registros para controle administrativo';
COMMENT ON COLUMN public.colaboradores.nome IS 'Nome completo do colaborador';
COMMENT ON COLUMN public.colaboradores.email IS 'Email do colaborador (único)';
COMMENT ON COLUMN public.colaboradores.cpf IS 'CPF do colaborador (único, formato: 000.000.000-00)';
COMMENT ON COLUMN public.colaboradores.cargo IS 'Cargo/função do colaborador';
COMMENT ON COLUMN public.colaboradores.departamento IS 'Departamento onde o colaborador trabalha';
COMMENT ON COLUMN public.colaboradores.data_admissao IS 'Data de admissão do colaborador';
COMMENT ON COLUMN public.colaboradores.unidade IS 'Unidade de trabalho: Campo Grande, Barra ou Recreio';
COMMENT ON COLUMN public.colaboradores.tipo_contratacao IS 'Tipo de contratação: CLT, PJ, Estágiário, Freelancer ou Horista';
COMMENT ON COLUMN public.colaboradores.banco IS 'Nome do banco para pagamento';
COMMENT ON COLUMN public.colaboradores.agencia IS 'Agência bancária';
COMMENT ON COLUMN public.colaboradores.conta IS 'Número da conta bancária';
COMMENT ON COLUMN public.colaboradores.tipo_conta IS 'Tipo da conta: corrente ou poupança';
COMMENT ON COLUMN public.colaboradores.status IS 'Status do colaborador: ativo ou inativo';