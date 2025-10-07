-- Remove the unique constraint that's causing the 409 error
-- The constraint is too restrictive for Coffee Connection evaluations
-- which should allow multiple evaluations between the same people in different periods

ALTER TABLE evaluations 
DROP CONSTRAINT IF EXISTS unique_coffee_connection_per_period;