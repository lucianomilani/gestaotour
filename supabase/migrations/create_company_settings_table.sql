-- Create Company Settings Table
-- This table stores a single record with company configuration

CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Basic Information
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    nif TEXT NOT NULL,
    
    -- Contact Information
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    contact TEXT NOT NULL, -- Contact person name
    
    -- Address Information
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    website TEXT,
    
    -- Visual Identity
    logo_url TEXT,
    description TEXT,
    
    -- Financial Information
    iban TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index for active status
CREATE INDEX IF NOT EXISTS idx_company_settings_active ON company_settings(is_active);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view company info)
CREATE POLICY "Enable read access for all users" ON company_settings FOR SELECT USING (true);

-- Create policy for authenticated users to insert
CREATE POLICY "Enable insert for authenticated users" ON company_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy for authenticated users to update
CREATE POLICY "Enable update for authenticated users" ON company_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy for authenticated users to delete
CREATE POLICY "Enable delete for authenticated users" ON company_settings
FOR DELETE
TO authenticated
USING (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_company_settings_updated_at();

-- Insert default company settings record
INSERT INTO company_settings (
    code,
    name,
    nif,
    email,
    phone,
    contact,
    address,
    postal_code,
    description,
    is_active
) VALUES (
    'COMPANY001',
    'Sua Empresa',
    '000000000',
    'contato@suaempresa.com',
    '+351 000 000 000',
    'Nome do Responsável',
    'Rua Principal, nº 123',
    '0000-000',
    'Descrição da sua empresa',
    true
) ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE company_settings IS 'Company configuration and branding settings (single record)';
COMMENT ON COLUMN company_settings.code IS 'Company code identifier';
COMMENT ON COLUMN company_settings.name IS 'Company name';
COMMENT ON COLUMN company_settings.nif IS 'Tax identification number';
COMMENT ON COLUMN company_settings.email IS 'Company contact email';
COMMENT ON COLUMN company_settings.phone IS 'Company contact phone';
COMMENT ON COLUMN company_settings.contact IS 'Contact person name';
COMMENT ON COLUMN company_settings.address IS 'Company address';
COMMENT ON COLUMN company_settings.postal_code IS 'Postal code';
COMMENT ON COLUMN company_settings.website IS 'Company website URL';
COMMENT ON COLUMN company_settings.logo_url IS 'URL to company logo image';
COMMENT ON COLUMN company_settings.description IS 'Company description';
COMMENT ON COLUMN company_settings.iban IS 'International Bank Account Number';
COMMENT ON COLUMN company_settings.is_active IS 'Whether the company settings are active';
