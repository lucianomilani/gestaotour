-- Migration: Align bookings table with frontend code
-- This renames columns to match what the frontend expects

-- Rename date columns
ALTER TABLE bookings RENAME COLUMN start_date TO date;
ALTER TABLE bookings DROP COLUMN end_date; -- Not used in current implementation

-- Rename participant columns
ALTER TABLE bookings RENAME COLUMN participants_adults TO adults;
ALTER TABLE bookings RENAME COLUMN participants_children TO children;
ALTER TABLE bookings RENAME COLUMN participants_babies TO babies;
ALTER TABLE bookings DROP COLUMN participants_total; -- Calculated on frontend

-- Rename financial columns
ALTER TABLE bookings RENAME COLUMN total_value TO total_amount;
ALTER TABLE bookings ADD COLUMN deposit_amount NUMERIC DEFAULT 0;

-- Add comments
COMMENT ON COLUMN bookings.date IS 'Date of the adventure/booking';
COMMENT ON COLUMN bookings.adults IS 'Number of adult participants';
COMMENT ON COLUMN bookings.children IS 'Number of child participants (4-12 years)';
COMMENT ON COLUMN bookings.babies IS 'Number of baby participants (<4 years)';
COMMENT ON COLUMN bookings.total_amount IS 'Total booking amount';
COMMENT ON COLUMN bookings.deposit_amount IS 'Deposit amount paid';
