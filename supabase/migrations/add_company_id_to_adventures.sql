-- Add company_id to adventures table
ALTER TABLE adventures 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_settings(id);

-- Backfill existing adventures with the default company (first company in the table)
UPDATE adventures 
SET company_id = (SELECT id FROM company_settings ORDER BY created_at LIMIT 1) 
WHERE company_id IS NULL;

-- Make company_id NOT NULL to enforce association
ALTER TABLE adventures 
ALTER COLUMN company_id SET NOT NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_adventures_company_id ON adventures(company_id);

-- Comment on column
COMMENT ON COLUMN adventures.company_id IS 'Link to the company this adventure belongs to. Required for multi-tenant architecture.';
