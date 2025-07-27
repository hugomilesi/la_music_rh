
-- Primeiro, vamos inserir alguns funcionários de demonstração se eles não existirem
INSERT INTO users (full_name, email, phone, position, department, units, start_date, status) 
VALUES 
  ('Maria Silva', 'maria.silva@empresa.com', '(21) 99999-0001', 'Gerente Geral', 'Administração', '{"campo-grande"}', '2022-01-15', 'active'),
  ('João Santos', 'joao.santos@empresa.com', '(21) 99999-0002', 'Coordenador Pedagógico', 'Educação', '{"recreio"}', '2022-03-10', 'active'),
  ('Ana Costa', 'ana.costa@empresa.com', '(21) 99999-0003', 'Consultora de Vendas', 'Vendas', '{"barra"}', '2022-05-20', 'active'),
  ('Pedro Lima', 'pedro.lima@empresa.com', '(21) 99999-0004', 'Professor Senior', 'Educação', '{"campo-grande", "recreio"}', '2021-08-12', 'active'),
  ('Carla Oliveira', 'carla.oliveira@empresa.com', '(21) 99999-0005', 'Recepcionista', 'Administrativo', '{"barra"}', '2023-01-05', 'active'),
  ('Rafael Mendes', 'rafael.mendes@empresa.com', '(21) 99999-0006', 'Consultor de Vendas', 'Vendas', '{"campo-grande"}', '2022-11-08', 'active'),
  ('Juliana Ferreira', 'juliana.ferreira@empresa.com', '(21) 99999-0007', 'Professora', 'Educação', '{"recreio", "barra"}', '2022-02-14', 'active'),
  ('Lucas Rodrigues', 'lucas.rodrigues@empresa.com', '(21) 99999-0008', 'Assistente Administrativo', 'Administrativo', '{"campo-grande"}', '2023-03-22', 'active'),
  ('Fernanda Alves', 'fernanda.alves@empresa.com', '(21) 99999-0009', 'Coordenadora de Vendas', 'Vendas', '{"recreio"}', '2021-12-03', 'active'),
  ('Bruno Cardoso', 'bruno.cardoso@empresa.com', '(21) 99999-0010', 'Professor', 'Educação', '{"barra"}', '2022-07-18', 'active'),
  ('Patrícia Gomes', 'patricia.gomes@empresa.com', '(21) 99999-0011', 'Coordenadora Administrativa', 'Administrativo', '{"campo-grande", "recreio"}', '2021-10-25', 'active'),
  ('Diego Souza', 'diego.souza@empresa.com', '(21) 99999-0012', 'Operacional', 'Operações', '{"barra"}', '2023-02-08', 'active'),
  ('Amanda Ribeiro', 'amanda.ribeiro@empresa.com', '(21) 99999-0013', 'Gerente de Vendas', 'Vendas', '{"campo-grande", "barra"}', '2021-06-30', 'active'),
  ('Thiago Pereira', 'thiago.pereira@empresa.com', '(21) 99999-0014', 'Professor', 'Educação', '{"recreio"}', '2022-09-12', 'active'),
  ('Camila Torres', 'camila.torres@empresa.com', '(21) 99999-0015', 'Assistente de Operações', 'Operações', '{"barra", "recreio"}', '2023-04-17', 'active')
ON CONFLICT (email) DO NOTHING;

-- Inserir as unidades se não existirem
INSERT INTO unidades (nome, codigo, ativa) 
VALUES 
  ('Campo Grande', 'CG', true),
  ('Recreio', 'RC', true),
  ('Barra da Tijuca', 'BT', true)
ON CONFLICT (codigo) DO NOTHING;

-- Criar folha de pagamento para janeiro de 2025 se não existir
INSERT INTO payrolls (month, year, status) 
VALUES (1, 2025, 'draft')
ON CONFLICT (month, year) DO NOTHING;

-- Agora vamos inserir dados de folha de pagamento realistas para cada funcionário
WITH payroll_data AS (
  SELECT id as payroll_id FROM payrolls WHERE month = 1 AND year = 2025 LIMIT 1
),
employee_payroll_data AS (
  SELECT 
    e.auth_user_id as colaborador_id,
    e.full_name as name,
    e.position,
    p.payroll_id,
    CASE 
      -- Gerência
      WHEN e.position LIKE '%Gerente%' THEN 8500 + (RANDOM() * 1500)::NUMERIC
      -- Coordenação
      WHEN e.position LIKE '%Coordenador%' THEN 6000 + (RANDOM() * 1000)::NUMERIC
      -- Vendas Senior
      WHEN e.position = 'Gerente de Vendas' THEN 7000 + (RANDOM() * 1200)::NUMERIC
      WHEN e.position = 'Coordenadora de Vendas' THEN 5500 + (RANDOM() * 800)::NUMERIC
      WHEN e.position LIKE '%Consultor%' THEN 3500 + (RANDOM() * 500)::NUMERIC
      -- Educação
      WHEN e.position = 'Professor Senior' THEN 4500 + (RANDOM() * 700)::NUMERIC
      WHEN e.position LIKE '%Professor%' THEN 3200 + (RANDOM() * 500)::NUMERIC
      -- Administrativo
      WHEN e.position LIKE '%Administrativo%' THEN 2800 + (RANDOM() * 400)::NUMERIC
      WHEN e.position = 'Recepcionista' THEN 2200 + (RANDOM() * 300)::NUMERIC
      -- Operacional
      ELSE 2000 + (RANDOM() * 300)::NUMERIC
    END as salario_base,
    CASE 
      -- Bônus baseado na posição
      WHEN e.position LIKE '%Gerente%' THEN (RANDOM() * 2000)::NUMERIC
      WHEN e.position LIKE '%Coordenador%' THEN (RANDOM() * 800)::NUMERIC
      WHEN e.position LIKE '%Vendas%' THEN (RANDOM() * 1200)::NUMERIC
      ELSE (RANDOM() * 300)::NUMERIC
    END as bonus,
    CASE 
      -- Comissão principalmente para vendas
      WHEN e.position LIKE '%Vendas%' OR e.position LIKE '%Consultor%' THEN (RANDOM() * 1500)::NUMERIC
      ELSE 0
    END as comissao,
    -- Valores fixos e variáveis para outros campos
    150 + (RANDOM() * 100)::NUMERIC as passagem,
    50 + (RANDOM() * 50)::NUMERIC as reembolso,
    -- INSS baseado no salário (aproximadamente 8-11%)
    CASE 
      WHEN e.position LIKE '%Gerente%' THEN 700 + (RANDOM() * 200)::NUMERIC
      WHEN e.position LIKE '%Coordenador%' THEN 500 + (RANDOM() * 150)::NUMERIC
      ELSE 250 + (RANDOM() * 200)::NUMERIC
    END as inss,
    (RANDOM() * 80)::NUMERIC as lojinha,
    (RANDOM() * 120)::NUMERIC as bistro,
    CASE 
      WHEN RANDOM() > 0.7 THEN (RANDOM() * 500)::NUMERIC
      ELSE 0
    END as adiantamento,
    (RANDOM() * 50)::NUMERIC as outros_descontos,
    CASE 
      WHEN e.position LIKE '%Gerente%' THEN 'Gerência'
      WHEN e.position LIKE '%Coordenador%' THEN 'Coordenação'
      WHEN e.position LIKE '%Vendas%' OR e.position LIKE '%Consultor%' THEN 'Vendas'
      WHEN e.position LIKE '%Professor%' THEN 'Educação'
      WHEN e.position LIKE '%Administrativo%' OR e.position = 'Recepcionista' THEN 'Administrativo'
      ELSE 'Operacional'
    END as classificacao,
    e.position as funcao
  FROM users e
  CROSS JOIN payroll_data p
  WHERE e.status = 'ativo'
)
INSERT INTO folha_pagamento (
  payroll_id, colaborador_id, classificacao, funcao,
  salario_base, bonus, comissao, passagem, reembolso,
  inss, lojinha, bistro, adiantamento, outros_descontos,
  status, mes, ano
)
SELECT 
  payroll_id, colaborador_id, classificacao, funcao,
  ROUND(salario_base, 2), ROUND(bonus, 2), ROUND(comissao, 2), 
  ROUND(passagem, 2), ROUND(reembolso, 2),
  ROUND(inss, 2), ROUND(lojinha, 2), ROUND(bistro, 2), 
  ROUND(adiantamento, 2), ROUND(outros_descontos, 2),
  'rascunho', 1, 2025
FROM employee_payroll_data
ON CONFLICT DO NOTHING;

-- Criar rateios automáticos para as unidades
WITH folha_entries AS (
  SELECT fp.id, e.units, (fp.salario_base + COALESCE(fp.bonus, 0)) as total_amount
  FROM folha_pagamento fp
  JOIN users e ON fp.colaborador_id = e.auth_user_id
  WHERE fp.mes = 1 AND fp.ano = 2025
),
unit_allocations AS (
  SELECT 
    fe.id as folha_pagamento_id,
    u.id as unidade_id,
    CASE 
      WHEN array_length(fe.units, 1) = 1 THEN fe.total_amount
      ELSE fe.total_amount / array_length(fe.units, 1)
    END as valor,
    CASE 
      WHEN array_length(fe.units, 1) = 1 THEN 100
      ELSE 100.0 / array_length(fe.units, 1)
    END as percentual
  FROM folha_entries fe
  JOIN unidades u ON u.codigo = ANY(
    CASE 
      WHEN 'campo-grande' = ANY(fe.units) AND u.codigo = 'CG' THEN ARRAY['CG']
      WHEN 'recreio' = ANY(fe.units) AND u.codigo = 'RC' THEN ARRAY['RC'] 
      WHEN 'barra' = ANY(fe.units) AND u.codigo = 'BT' THEN ARRAY['BT']
      ELSE ARRAY[]::text[]
    END
  )
)
INSERT INTO folha_rateio (folha_pagamento_id, unidade_id, valor, percentual)
SELECT folha_pagamento_id, unidade_id, ROUND(valor, 2), ROUND(percentual, 2)
FROM unit_allocations
ON CONFLICT DO NOTHING;
