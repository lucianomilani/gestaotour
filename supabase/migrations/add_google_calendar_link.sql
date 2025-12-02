-- Migration: Add google_calendar_link to bookings table
-- Run this in your Supabase SQL Editor

ALTER TABLE bookings 
ADD COLUMN google_calendar_link TEXT;

-- Add comment for documentation
COMMENT ON COLUMN bookings.google_calendar_link IS 'URL link to Google Calendar event for this booking';
