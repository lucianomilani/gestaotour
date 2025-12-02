-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Agencies Table
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    email TEXT,
    phone TEXT,
    nif TEXT,
    contact TEXT,
    fee NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Adventures Table
CREATE TABLE adventures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    meeting_point TEXT,
    duration TEXT,
    price_adult NUMERIC DEFAULT 0,
    price_child NUMERIC DEFAULT 0,
    price_baby NUMERIC DEFAULT 0,
    
    -- Season Configuration
    high_season_start DATE,
    high_season_end DATE,
    high_season_times TEXT[], -- Array of time strings
    
    low_season_start DATE,
    low_season_end DATE,
    low_season_times TEXT[], -- Array of time strings
    
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Client Info
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    client_nif TEXT,
    client_country TEXT,
    client_city TEXT,
    
    -- Relationships
    adventure_id UUID REFERENCES adventures(id),
    agency_id UUID REFERENCES agencies(id), -- Nullable for 'Particular'
    
    -- Booking Details
    date DATE NOT NULL,
    time TEXT,
    
    -- Participants
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    babies INTEGER DEFAULT 0,
    
    -- Financials
    total_amount NUMERIC DEFAULT 0,
    deposit_amount NUMERIC DEFAULT 0,
    status TEXT CHECK (status IN ('Confirmada', 'Pendente', 'Cancelada', 'Concluída')) DEFAULT 'Pendente',
    payment_status TEXT DEFAULT 'Pendente',
    payment_type TEXT,
    
    notes TEXT,
    google_calendar_link TEXT
);

-- Row Level Security (RLS) - Optional for now, but good practice
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access for now (development mode)
-- WARNING: In production, you should restrict this!
CREATE POLICY "Enable all access for all users" ON agencies FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON adventures FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON bookings FOR ALL USING (true);
