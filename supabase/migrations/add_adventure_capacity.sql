-- Add capacity fields to adventures table
-- NULL = unlimited (infinite capacity)

ALTER TABLE adventures 
ADD COLUMN min_capacity INTEGER DEFAULT NULL,
ADD COLUMN max_capacity INTEGER DEFAULT NULL;

-- Add constraint: if both are set, min must be less than or equal to max
ALTER TABLE adventures
ADD CONSTRAINT check_capacity_range 
CHECK (
    (min_capacity IS NULL OR max_capacity IS NULL) OR 
    (min_capacity <= max_capacity)
);

-- Add comments for documentation
COMMENT ON COLUMN adventures.min_capacity IS 'Minimum number of participants required. NULL = no minimum.';
COMMENT ON COLUMN adventures.max_capacity IS 'Maximum number of participants allowed. NULL = unlimited.';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'adventures' 
  AND column_name IN ('min_capacity', 'max_capacity');
