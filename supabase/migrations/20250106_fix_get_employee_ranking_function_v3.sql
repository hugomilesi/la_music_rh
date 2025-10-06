-- Remover a função existente e recriar com nomes únicos
DROP FUNCTION IF EXISTS get_employee_ranking(UUID, TEXT);

-- Recriar a função com nomes únicos para evitar ambiguidade
CREATE OR REPLACE FUNCTION get_employee_ranking(
  program_filter UUID DEFAULT NULL,
  evaluation_period_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  employee_id UUID,
  employee_name VARCHAR(255),
  employee_unit VARCHAR(255),
  employee_role VARCHAR(255),
  fideliza_stars_count INTEGER,
  matriculador_stars_count INTEGER,
  professor_stars_count INTEGER,
  total_stars_count INTEGER,
  ranking_position INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH employee_stars AS (
    SELECT 
      c.id as employee_id,
      c.nome as employee_name,
      c.unidade as employee_unit,
      c.cargo as employee_role,
      -- Estrelas do programa Fideliza+
      COALESCE((
        SELECT SUM(ce.stars_awarded)::INTEGER
        FROM criterion_evaluations ce
        JOIN recognition_criteria rc ON ce.criterion_id = rc.id
        JOIN recognition_programs rp ON rc.program_id = rp.id
        WHERE ce.employee_id = c.id 
        AND rp.name = 'Fideliza+'
        AND (evaluation_period_filter IS NULL OR ce.evaluation_period = evaluation_period_filter)
      ), 0) as fideliza_stars_count,
      
      -- Estrelas do programa Matriculador+ LA
      COALESCE((
        SELECT SUM(ce.stars_awarded)::INTEGER
        FROM criterion_evaluations ce
        JOIN recognition_criteria rc ON ce.criterion_id = rc.id
        JOIN recognition_programs rp ON rc.program_id = rp.id
        WHERE ce.employee_id = c.id 
        AND rp.name = 'Matriculador+ LA'
        AND (evaluation_period_filter IS NULL OR ce.evaluation_period = evaluation_period_filter)
      ), 0) as matriculador_stars_count,
      
      -- Estrelas do programa Professor+ LA
      COALESCE((
        SELECT SUM(ce.stars_awarded)::INTEGER
        FROM criterion_evaluations ce
        JOIN recognition_criteria rc ON ce.criterion_id = rc.id
        JOIN recognition_programs rp ON rc.program_id = rp.id
        WHERE ce.employee_id = c.id 
        AND rp.name = 'Professor+ LA'
        AND (evaluation_period_filter IS NULL OR ce.evaluation_period = evaluation_period_filter)
      ), 0) as professor_stars_count
    FROM colaboradores c
    WHERE c.status != 'inativo'
  ),
  ranked_employees AS (
    SELECT 
      es.employee_id,
      es.employee_name,
      es.employee_unit,
      es.employee_role,
      es.fideliza_stars_count,
      es.matriculador_stars_count,
      es.professor_stars_count,
      (es.fideliza_stars_count + es.matriculador_stars_count + es.professor_stars_count) as total_stars_count,
      ROW_NUMBER() OVER (ORDER BY (es.fideliza_stars_count + es.matriculador_stars_count + es.professor_stars_count) DESC) as ranking_position
    FROM employee_stars es
  )
  SELECT 
    re.employee_id,
    re.employee_name,
    re.employee_unit,
    re.employee_role,
    re.fideliza_stars_count,
    re.matriculador_stars_count,
    re.professor_stars_count,
    re.total_stars_count,
    re.ranking_position::INTEGER
  FROM ranked_employees re
  WHERE (
    program_filter IS NULL 
    OR (program_filter IN (
      SELECT id FROM recognition_programs WHERE name = 'Fideliza+'
    ) AND re.fideliza_stars_count > 0)
    OR (program_filter IN (
      SELECT id FROM recognition_programs WHERE name = 'Matriculador+ LA'
    ) AND re.matriculador_stars_count > 0)
    OR (program_filter IN (
      SELECT id FROM recognition_programs WHERE name = 'Professor+ LA'
    ) AND re.professor_stars_count > 0)
  )
  ORDER BY re.total_stars_count DESC, re.employee_name ASC;
END;
$$ LANGUAGE plpgsql;