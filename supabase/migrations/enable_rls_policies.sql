-- Enable Row Level Security and create policies for multi-tenant data isolation
-- This ensures users can only access data from their own company

-- ============================================================
-- STAFF TABLE
-- ============================================================

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view staff from their own company
CREATE POLICY "Users see own company staff"
ON staff
FOR SELECT
USING (company_id = auth.user_company_id());

-- INSERT: Users can create staff in their own company
CREATE POLICY "Users insert own company staff"
ON staff
FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

-- UPDATE: Users can update staff from their own company
CREATE POLICY "Users update own company staff"
ON staff
FOR UPDATE
USING (company_id = auth.user_company_id())
WITH CHECK (company_id = auth.user_company_id());

-- DELETE: Users can delete staff from their own company
CREATE POLICY "Users delete own company staff"
ON staff
FOR DELETE
USING (company_id = auth.user_company_id());

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own company bookings"
ON bookings
FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users insert own company bookings"
ON bookings
FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users update own company bookings"
ON bookings
FOR UPDATE
USING (company_id = auth.user_company_id())
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users delete own company bookings"
ON bookings
FOR DELETE
USING (company_id = auth.user_company_id());

-- ============================================================
-- ADVENTURES TABLE
-- ============================================================

ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own company adventures"
ON adventures
FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users insert own company adventures"
ON adventures
FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users update own company adventures"
ON adventures
FOR UPDATE
USING (company_id = auth.user_company_id())
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users delete own company adventures"
ON adventures
FOR DELETE
USING (company_id = auth.user_company_id());

-- ============================================================
-- AGENCIES TABLE
-- ============================================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own company agencies"
ON agencies
FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users insert own company agencies"
ON agencies
FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users update own company agencies"
ON agencies
FOR UPDATE
USING (company_id = auth.user_company_id())
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users delete own company agencies"
ON agencies
FOR DELETE
USING (company_id = auth.user_company_id());

-- ============================================================
-- PAYMENT_METHODS TABLE
-- ============================================================

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own company payment_methods"
ON payment_methods
FOR SELECT
USING (company_id = auth.user_company_id());

CREATE POLICY "Users insert own company payment_methods"
ON payment_methods
FOR INSERT
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users update own company payment_methods"
ON payment_methods
FOR UPDATE
USING (company_id = auth.user_company_id())
WITH CHECK (company_id = auth.user_company_id());

CREATE POLICY "Users delete own company payment_methods"
ON payment_methods
FOR DELETE
USING (company_id = auth.user_company_id());

-- ============================================================
-- COMPANY_SETTINGS TABLE (READ-ONLY for own company)
-- ============================================================

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own company settings
CREATE POLICY "Users see own company settings"
ON company_settings
FOR SELECT
USING (id = auth.user_company_id());

-- Users can update their own company settings
CREATE POLICY "Users update own company settings"
ON company_settings
FOR UPDATE
USING (id = auth.user_company_id())
WITH CHECK (id = auth.user_company_id());

-- Note: INSERT and DELETE are not allowed for company_settings
-- Companies should be created by system administrators only
