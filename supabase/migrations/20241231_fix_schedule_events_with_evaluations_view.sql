-- Corrigir a view schedule_events_with_evaluations para usar o relacionamento correto
DROP VIEW IF EXISTS schedule_events_with_evaluations;

CREATE VIEW schedule_events_with_evaluations AS
-- Eventos regulares da agenda
SELECT 
    se.id::text AS id,
    se.title,
    se.description,
    se.start_date,
    se.end_date,
    se.user_id,
    se.event_type,
    se.location,
    se.is_all_day,
    se.recurrence_pattern,
    se.attendees,
    se.status,
    se.priority,
    se.created_at,
    se.updated_at,
    se.evaluation_id,
    se.unit,
    false AS is_evaluation,
    false AS is_removable_disabled,
    c.nome AS employee_name
FROM schedule_events se
LEFT JOIN colaboradores c ON c.id = se.user_id

UNION ALL

-- Avaliações como eventos
SELECT 
    ('eval_' || e.id::text) AS id,
    CASE 
        WHEN e.evaluation_type = 'Coffee Connection' THEN 'Coffee Connection'
        WHEN e.evaluation_type = 'Avaliação 360°' THEN 'Avaliação 360°'
        WHEN e.evaluation_type = 'Auto Avaliação' THEN 'Auto Avaliação'
        WHEN e.evaluation_type = 'Avaliação do Gestor' THEN 'Avaliação do Gestor'
        ELSE 'Avaliação'
    END AS title,
    COALESCE(e.feedback, 'Avaliação agendada') AS description,
    e.date AS start_date,
    e.date + INTERVAL '1 hour' AS end_date,
    e.employee_id AS user_id,
    'evaluation' AS event_type,
    COALESCE(e.location, 'A definir') AS location,
    false AS is_all_day,
    NULL::jsonb AS recurrence_pattern,
    jsonb_build_array(
        jsonb_build_object('id', e.employee_id, 'type', 'employee'),
        jsonb_build_object('id', e.evaluator_id, 'type', 'evaluator')
    ) AS attendees,
    CASE 
        WHEN e.status = 'draft' THEN 'scheduled'
        WHEN e.status = 'submitted' THEN 'in_progress'
        WHEN e.status = 'reviewed' THEN 'completed'
        WHEN e.status = 'finalized' THEN 'completed'
        ELSE 'scheduled'
    END AS status,
    'high' AS priority,
    e.created_at,
    e.updated_at,
    e.id AS evaluation_id,
    e.unit,
    true AS is_evaluation,
    true AS is_removable_disabled,
    c.nome AS employee_name
FROM evaluations e
LEFT JOIN colaboradores c ON c.id = e.employee_id
WHERE e.date IS NOT NULL;