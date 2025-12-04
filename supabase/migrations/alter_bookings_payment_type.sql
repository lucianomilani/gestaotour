-- Migrate bookings table to use payment_method_id foreign key
-- This migration maintains backward compatibility by keeping the old payment_type column

-- Step 1: Add new payment_method_id column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id);

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method_id);

-- Step 3: Migrate existing data from payment_type to payment_method_id
-- Map text values to the corresponding payment method IDs
UPDATE bookings b
SET payment_method_id = pm.id
FROM payment_methods pm
WHERE b.payment_type IS NOT NULL
  AND b.payment_method_id IS NULL
  AND (
    (b.payment_type = 'MBWay' AND pm.code = 'mbway') OR
    (b.payment_type = 'Transferência Bancária' AND pm.code = 'bank_transfer') OR
    (b.payment_type = 'PayPal' AND pm.code = 'paypal') OR
    (b.payment_type = 'Pagamento no Local' AND pm.code = 'cash_on_site')
  );

-- Step 4: For any remaining unmapped bookings, set to default (Transferência Bancária)
UPDATE bookings b
SET payment_method_id = (SELECT id FROM payment_methods WHERE code = 'bank_transfer' LIMIT 1)
WHERE payment_method_id IS NULL;

-- Note: We keep the payment_type column for now to ensure backward compatibility
-- It can be removed in a future migration after confirming everything works correctly
-- To remove it later, run: ALTER TABLE bookings DROP COLUMN payment_type;
