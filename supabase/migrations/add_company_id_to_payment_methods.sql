-- Add company_id to payment_methods table
ALTER TABLE payment_methods 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_settings(id);

-- Backfill existing payment methods with the default company (first company in the table)
UPDATE payment_methods 
SET company_id = (SELECT id FROM company_settings ORDER BY created_at LIMIT 1) 
WHERE company_id IS NULL;

-- Make company_id NOT NULL to enforce association
ALTER TABLE payment_methods 
ALTER COLUMN company_id SET NOT NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_company_id ON payment_methods(company_id);

-- Comment on column
COMMENT ON COLUMN payment_methods.company_id IS 'Link to the company this payment method belongs to. Each company manages its own payment methods.';
