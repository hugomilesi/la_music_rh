-- Criar colaboradores de teste

INSERT INTO colaboradores (id, nome, email, cpf, cargo, departamento, unidade, tipo_contratacao, status) VALUES
('4ebb3a3a-9ba3-4ca7-b3a1-373f505301fa', 'Ana Silva Santos', 'ana.silva@empresa.com', '123.456.789-01', 'Analista', 'TI', 'Campo Grande', 'CLT', 'ativo'),
('5a4d3593-a78b-4628-98ee-bd5198f125ea', 'Bruno Henrique Silva', 'bruno.silva@empresa.com', '234.567.890-12', 'Desenvolvedor', 'TI', 'Barra', 'CLT', 'ativo'),
('bdb1574a-fe1e-44cf-9fe5-c5280f89c7a1', 'Camila Alves Souza', 'camila.souza@empresa.com', '345.678.901-23', 'Designer', 'Marketing', 'Recreio', 'CLT', 'ativo'),
('9e7020eb-f434-4f8c-9a6c-b43b0097ddaa', 'Carlos Eduardo Lima', 'carlos.lima@empresa.com', '456.789.012-34', 'Gerente', 'Vendas', 'Campo Grande', 'CLT', 'ativo'),
('f8c3d2e1-a9b8-4c7d-9e6f-1a2b3c4d5e6f', 'Maria Fernanda Costa', 'maria.costa@empresa.com', '567.890.123-45', 'Coordenadora', 'RH', 'Barra', 'CLT', 'ativo'),
('a1b2c3d4-e5f6-4789-abc1-234567890def', 'João Pedro Oliveira', 'joao.oliveira@empresa.com', '678.901.234-56', 'Assistente', 'Financeiro', 'Recreio', 'CLT', 'ativo'),
('b2c3d4e5-f6a7-4890-bcd2-345678901efa', 'Juliana Santos Lima', 'juliana.lima@empresa.com', '789.012.345-67', 'Analista', 'Marketing', 'Campo Grande', 'CLT', 'ativo'),
('c3d4e5f6-a7b8-4901-cde3-456789012fab', 'Rafael Mendes Costa', 'rafael.costa@empresa.com', '890.123.456-78', 'Desenvolvedor', 'TI', 'Barra', 'CLT', 'ativo'),
('d4e5f6a7-b8c9-4012-def4-567890123abc', 'Fernanda Rodrigues', 'fernanda.rodrigues@empresa.com', '901.234.567-89', 'Supervisora', 'Operações', 'Recreio', 'CLT', 'ativo'),
('e5f6a7b8-c9d0-4123-efa5-678901234bcd', 'Lucas Almeida Silva', 'lucas.silva@empresa.com', '012.345.678-90', 'Técnico', 'Suporte', 'Campo Grande', 'CLT', 'ativo'),
('f6a7b8c9-d0e1-4234-fab6-789012345cde', 'Patricia Oliveira Santos', 'patricia.santos@empresa.com', '123.456.789-02', 'Gerente', 'RH', 'Barra', 'CLT', 'ativo')
ON CONFLICT (id) DO NOTHING;

-- Verificar se os colaboradores foram inseridos
SELECT 'Colaboradores inseridos:' as info, COUNT(*) as total FROM colaboradores WHERE status = 'ativo';