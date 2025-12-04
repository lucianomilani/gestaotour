-- Add dedicated API configuration fields to payment_methods table
-- This migration adds structured fields for storing API connection data

ALTER TABLE payment_methods
ADD COLUMN IF NOT EXISTS api_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS api_endpoint TEXT,
ADD COLUMN IF NOT EXISTS api_key_encrypted TEXT,
ADD COLUMN IF NOT EXISTS api_secret_encrypted TEXT,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_secret_encrypted TEXT,
ADD COLUMN IF NOT EXISTS sandbox_mode BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS api_version TEXT,
ADD COLUMN IF NOT EXISTS additional_config JSONB DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN payment_methods.api_enabled IS 'Whether API integration is enabled for this payment method';
COMMENT ON COLUMN payment_methods.api_endpoint IS 'Base URL for the payment API endpoint';
COMMENT ON COLUMN payment_methods.api_key_encrypted IS 'Encrypted API key for authentication';
COMMENT ON COLUMN payment_methods.api_secret_encrypted IS 'Encrypted API secret for authentication';
COMMENT ON COLUMN payment_methods.webhook_url IS 'Webhook URL for payment notifications';
COMMENT ON COLUMN payment_methods.webhook_secret_encrypted IS 'Encrypted webhook secret for signature verification';
COMMENT ON COLUMN payment_methods.sandbox_mode IS 'Whether to use sandbox/test mode (true) or production mode (false)';
COMMENT ON COLUMN payment_methods.api_version IS 'API version to use (e.g., v1, v2, 2023-10-01)';
COMMENT ON COLUMN payment_methods.additional_config IS 'Additional API-specific configuration in JSON format';

-- Create index for API-enabled methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_api_enabled ON payment_methods(api_enabled) WHERE api_enabled = true;
