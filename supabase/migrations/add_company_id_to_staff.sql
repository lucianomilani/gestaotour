-- Add company_id to staff table
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_settings(id);

-- Backfill existing staff with the default company (first company in the table)
UPDATE staff 
SET company_id = (SELECT id FROM company_settings ORDER BY created_at LIMIT 1) 
WHERE company_id IS NULL;

-- Make company_id NOT NULL to enforce association
ALTER TABLE staff 
ALTER COLUMN company_id SET NOT NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_staff_company_id ON staff(company_id);

-- Comment on column
COMMENT ON COLUMN staff.company_id IS 'Link to the company this staff member belongs to. Required for multi-tenant architecture.';
