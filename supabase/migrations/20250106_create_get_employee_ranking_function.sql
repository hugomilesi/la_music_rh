-- Função para obter ranking de funcionários com base nos programas de reconhecimento
CREATE OR REPLACE FUNCTION get_employee_ranking(
  program_filter UUID DEFAULT NULL,
  evaluation_period_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  employee_id UUID,
  employee_name TEXT,
  employee_unit TEXT,
  employee_role TEXT,
  fideliza_stars INTEGER,
  matriculador_stars INTEGER,
  professor_stars INTEGER,
  total_stars INTEGER,
  ranking_position INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH employee_stars AS (
    SELECT 
      c.id as emp_id,
      c.nome as emp_name,
      c.unidade as emp_unit,
      c.cargo as emp_role,
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
      emp_id,
      emp_name,
      emp_unit,
      emp_role,
      fideliza_stars_count,
      matriculador_stars_count,
      professor_stars_count,
      (fideliza_stars_count + matriculador_stars_count + professor_stars_count) as total_stars_count,
      ROW_NUMBER() OVER (ORDER BY (fideliza_stars_count + matriculador_stars_count + professor_stars_count) DESC) as position
    FROM employee_stars
  )
  SELECT 
    re.emp_id,
    re.emp_name,
    re.emp_unit,
    re.emp_role,
    re.fideliza_stars_count,
    re.matriculador_stars_count,
    re.professor_stars_count,
    re.total_stars_count,
    re.position::INTEGER
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
  ORDER BY re.total_stars_count DESC, re.emp_name ASC;
END;
$$;