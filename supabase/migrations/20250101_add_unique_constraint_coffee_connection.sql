-- Add unique constraint to prevent duplicate Coffee Connection evaluations
-- This constraint ensures that the same employee cannot have multiple Coffee Connection evaluations
-- with the same evaluator in the same evaluation period

ALTER TABLE evaluations 
ADD CONSTRAINT unique_coffee_connection_per_period 
UNIQUE (employee_id, evaluator_id, evaluation_period_start, evaluation_period_end, evaluation_type);