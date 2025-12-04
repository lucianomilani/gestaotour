-- Update RLS policies to allow SuperAdmin access to all companies
-- SuperAdmins bypass company_id restrictions

-- ============================================================
-- HELPER FUNCTION: Check if current user is SuperAdmin
-- ============================================================

CREATE OR REPLACE FUNCTION auth.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_superadmin, false) 
  FROM staff 
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

COMMENT ON FUNCTION auth.is_superadmin IS 'Returns true if the currently authenticated user is a SuperAdmin. SuperAdmins have access to all companies.';

-- ============================================================
-- UPDATE EXISTING POLICIES: Add SuperAdmin exception
-- ============================================================

-- STAFF TABLE
DROP POLICY IF EXISTS "Users see own company staff" ON staff;
CREATE POLICY "Users see own company staff"
ON staff
FOR SELECT
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users insert own company staff" ON staff;
CREATE POLICY "Users insert own company staff"
ON staff
FOR INSERT
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users update own company staff" ON staff;
CREATE POLICY "Users update own company staff"
ON staff
FOR UPDATE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
)
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users delete own company staff" ON staff;
CREATE POLICY "Users delete own company staff"
ON staff
FOR DELETE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users see own company bookings" ON bookings;
CREATE POLICY "Users see own company bookings"
ON bookings
FOR SELECT
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users insert own company bookings" ON bookings;
CREATE POLICY "Users insert own company bookings"
ON bookings
FOR INSERT
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users update own company bookings" ON bookings;
CREATE POLICY "Users update own company bookings"
ON bookings
FOR UPDATE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
)
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users delete own company bookings" ON bookings;
CREATE POLICY "Users delete own company bookings"
ON bookings
FOR DELETE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

-- ============================================================
-- ADVENTURES TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users see own company adventures" ON adventures;
CREATE POLICY "Users see own company adventures"
ON adventures
FOR SELECT
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users insert own company adventures" ON adventures;
CREATE POLICY "Users insert own company adventures"
ON adventures
FOR INSERT
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users update own company adventures" ON adventures;
CREATE POLICY "Users update own company adventures"
ON adventures
FOR UPDATE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
)
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users delete own company adventures" ON adventures;
CREATE POLICY "Users delete own company adventures"
ON adventures
FOR DELETE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

-- ============================================================
-- AGENCIES TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users see own company agencies" ON agencies;
CREATE POLICY "Users see own company agencies"
ON agencies
FOR SELECT
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users insert own company agencies" ON agencies;
CREATE POLICY "Users insert own company agencies"
ON agencies
FOR INSERT
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users update own company agencies" ON agencies;
CREATE POLICY "Users update own company agencies"
ON agencies
FOR UPDATE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
)
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users delete own company agencies" ON agencies;
CREATE POLICY "Users delete own company agencies"
ON agencies
FOR DELETE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

-- ============================================================
-- PAYMENT_METHODS TABLE
-- ============================================================

DROP POLICY IF EXISTS "Users see own company payment_methods" ON payment_methods;
CREATE POLICY "Users see own company payment_methods"
ON payment_methods
FOR SELECT
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users insert own company payment_methods" ON payment_methods;
CREATE POLICY "Users insert own company payment_methods"
ON payment_methods
FOR INSERT
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users update own company payment_methods" ON payment_methods;
CREATE POLICY "Users update own company payment_methods"
ON payment_methods
FOR UPDATE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
)
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

DROP POLICY IF EXISTS "Users delete own company payment_methods" ON payment_methods;
CREATE POLICY "Users delete own company payment_methods"
ON payment_methods
FOR DELETE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

-- ============================================================
-- COMPANY_SETTINGS TABLE (Special Policies)
-- ============================================================

DROP POLICY IF EXISTS "Users see own company settings" ON company_settings;
CREATE POLICY "Users see own company settings"
ON company_settings
FOR SELECT
USING (
  id = auth.user_company_id() 
  OR auth.is_superadmin() = true  -- SuperAdmin sees all companies
);

DROP POLICY IF EXISTS "Users update own company settings" ON company_settings;
CREATE POLICY "Users update own company settings"
ON company_settings
FOR UPDATE
USING (
  id = auth.user_company_id() 
  OR auth.is_superadmin() = true
)
WITH CHECK (
  id = auth.user_company_id() 
  OR auth.is_superadmin() = true
);

-- NEW: SuperAdmin can create new companies
DROP POLICY IF EXISTS "SuperAdmin can create companies" ON company_settings;
CREATE POLICY "SuperAdmin can create companies"
ON company_settings
FOR INSERT
WITH CHECK (auth.is_superadmin() = true);

-- NEW: SuperAdmin can delete companies
DROP POLICY IF EXISTS "SuperAdmin can delete companies" ON company_settings;
CREATE POLICY "SuperAdmin can delete companies"
ON company_settings
FOR DELETE
USING (auth.is_superadmin() = true);

-- ============================================================
-- VERIFICATION
-- ============================================================

-- To verify policies are active, run:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename IN ('staff', 'bookings', 'adventures', 'agencies', 'payment_methods', 'company_settings')
-- ORDER BY tablename, policyname;
