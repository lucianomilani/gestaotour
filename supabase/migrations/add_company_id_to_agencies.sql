-- Add company_id to agencies table
-- Note: Agencies might be shared across companies or company-specific
-- For now, we make them company-specific for data isolation
ALTER TABLE agencies 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_settings(id);

-- Backfill existing agencies with the default company (first company in the table)
UPDATE agencies 
SET company_id = (SELECT id FROM company_settings ORDER BY created_at LIMIT 1) 
WHERE company_id IS NULL;

-- Make company_id NOT NULL to enforce association
ALTER TABLE agencies 
ALTER COLUMN company_id SET NOT NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_agencies_company_id ON agencies(company_id);

-- Comment on column
COMMENT ON COLUMN agencies.company_id IS 'Link to the company this agency belongs to. Each company manages its own agencies.';
