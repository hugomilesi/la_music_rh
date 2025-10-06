-- Corrigir nomes dos campos da função get_employee_ranking para corresponder ao frontend
DROP FUNCTION IF EXISTS get_employee_ranking(uuid, text);

CREATE OR REPLACE FUNCTION get_employee_ranking(
  program_filter uuid DEFAULT NULL,
  evaluation_period_filter text DEFAULT NULL
)
RETURNS TABLE(
  employee_id uuid,
  employee_name varchar,
  employee_unit varchar,
  employee_role varchar,
  fideliza_stars integer,
  matriculador_stars integer,
  professor_stars integer,
  total_stars integer,
  ranking_position integer
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
      ), 0) as fideliza_stars_calc,
      
      -- Estrelas do programa Matriculador+ LA
      COALESCE((
        SELECT SUM(ce.stars_awarded)::INTEGER
        FROM criterion_evaluations ce
        JOIN recognition_criteria rc ON ce.criterion_id = rc.id
        JOIN recognition_programs rp ON rc.program_id = rp.id
        WHERE ce.employee_id = c.id 
        AND rp.name = 'Matriculador+ LA'
        AND (evaluation_period_filter IS NULL OR ce.evaluation_period = evaluation_period_filter)
      ), 0) as matriculador_stars_calc,
      
      -- Estrelas do programa Professor+ LA
      COALESCE((
        SELECT SUM(ce.stars_awarded)::INTEGER
        FROM criterion_evaluations ce
        JOIN recognition_criteria rc ON ce.criterion_id = rc.id
        JOIN recognition_programs rp ON rc.program_id = rp.id
        WHERE ce.employee_id = c.id 
        AND rp.name = 'Professor+ LA'
        AND (evaluation_period_filter IS NULL OR ce.evaluation_period = evaluation_period_filter)
      ), 0) as professor_stars_calc
    FROM colaboradores c
    WHERE c.status != 'inativo'
  ),
  ranked_employees AS (
    SELECT 
      es.emp_id,
      es.emp_name,
      es.emp_unit,
      es.emp_role,
      es.fideliza_stars_calc,
      es.matriculador_stars_calc,
      es.professor_stars_calc,
      (es.fideliza_stars_calc + es.matriculador_stars_calc + es.professor_stars_calc) as total_stars_calc,
      ROW_NUMBER() OVER (ORDER BY (es.fideliza_stars_calc + es.matriculador_stars_calc + es.professor_stars_calc) DESC) as rank_pos
    FROM employee_stars es
  )
  SELECT 
    re.emp_id as employee_id,
    re.emp_name as employee_name,
    re.emp_unit as employee_unit,
    re.emp_role as employee_role,
    re.fideliza_stars_calc as fideliza_stars,
    re.matriculador_stars_calc as matriculador_stars,
    re.professor_stars_calc as professor_stars,
    re.total_stars_calc as total_stars,
    re.rank_pos::INTEGER as ranking_position
  FROM ranked_employees re
  WHERE (
    program_filter IS NULL 
    OR (program_filter IN (
      SELECT id FROM recognition_programs WHERE name = 'Fideliza+'
    ) AND re.fideliza_stars_calc > 0)
    OR (program_filter IN (
      SELECT id FROM recognition_programs WHERE name = 'Matriculador+ LA'
    ) AND re.matriculador_stars_calc > 0)
    OR (program_filter IN (
      SELECT id FROM recognition_programs WHERE name = 'Professor+ LA'
    ) AND re.professor_stars_calc > 0)
  )
  ORDER BY re.total_stars_calc DESC, re.emp_name ASC;
END;
$$;