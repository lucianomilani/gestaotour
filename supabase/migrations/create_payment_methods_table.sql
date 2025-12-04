-- Create Payment Methods Table
-- This table centralizes payment method management and supports future API integrations

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Basic Information
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- API Integration Support
    api_config JSONB, -- Store API credentials, endpoints, and configuration
    
    -- UI Configuration
    icon TEXT, -- Icon identifier for frontend
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active, display_order);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (development mode)
CREATE POLICY "Enable read access for all users" ON payment_methods FOR SELECT USING (true);

-- Seed initial payment methods
INSERT INTO payment_methods (name, code, description, display_order, is_active) VALUES
    ('MBWay', 'mbway', 'Pagamento via MBWay', 1, true),
    ('Transferência Bancária', 'bank_transfer', 'Transferência bancária tradicional', 2, true),
    ('PayPal', 'paypal', 'Pagamento via PayPal', 3, true),
    ('Pagamento no Local', 'cash_on_site', 'Pagamento em dinheiro no local', 4, true)
ON CONFLICT (code) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_methods_updated_at();
