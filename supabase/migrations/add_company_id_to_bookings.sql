-- Add company_id to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_settings(id);

-- Backfill existing bookings with the default company (first company in the table)
UPDATE bookings 
SET company_id = (SELECT id FROM company_settings ORDER BY created_at LIMIT 1) 
WHERE company_id IS NULL;

-- Make company_id NOT NULL to enforce association
ALTER TABLE bookings 
ALTER COLUMN company_id SET NOT NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_company_id ON bookings(company_id);

-- Comment on column
COMMENT ON COLUMN bookings.company_id IS 'Link to the company this booking belongs to. Required for multi-tenant architecture.';
