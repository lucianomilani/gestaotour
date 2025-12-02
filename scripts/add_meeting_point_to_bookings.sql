-- Add meeting_point column to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS meeting_point TEXT;

-- Add comment to the column
COMMENT ON COLUMN bookings.meeting_point IS 'Specific meeting point for this booking. If null, falls back to adventure default.';
