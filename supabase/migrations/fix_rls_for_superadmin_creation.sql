-- 1. Helper function to check if user is SuperAdmin
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM staff
    WHERE auth_id = auth.uid()
    AND is_superadmin = true
  );
$$ LANGUAGE SQL SECURITY DEFINER;

COMMENT ON FUNCTION auth.is_super_admin IS 'Returns true if the current user is a SuperAdmin.';

-- 2. Update COMPANY_SETTINGS policies
-- Allow SuperAdmins to INSERT new companies
CREATE POLICY "SuperAdmins insert companies"
ON company_settings
FOR INSERT
WITH CHECK (auth.is_super_admin());

-- Allow SuperAdmins to UPDATE any company
DROP POLICY IF EXISTS "Users update own company settings" ON company_settings;
CREATE POLICY "Users update own company settings"
ON company_settings
FOR UPDATE
USING (
  id = auth.user_company_id() 
  OR auth.is_super_admin()
)
WITH CHECK (
  id = auth.user_company_id() 
  OR auth.is_super_admin()
);

-- Allow SuperAdmins to SELECT any company (already covered by existing logic? No, let's ensure it)
DROP POLICY IF EXISTS "Users see own company settings" ON company_settings;
CREATE POLICY "Users see own company settings"
ON company_settings
FOR SELECT
USING (
  id = auth.user_company_id() 
  OR auth.is_super_admin()
);


-- 3. Update STAFF policies
-- Allow SuperAdmins to INSERT staff for ANY company
DROP POLICY IF EXISTS "Users insert own company staff" ON staff;
CREATE POLICY "Users insert own company staff"
ON staff
FOR INSERT
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_super_admin()
);

-- Allow SuperAdmins to UPDATE staff for ANY company
DROP POLICY IF EXISTS "Users update own company staff" ON staff;
CREATE POLICY "Users update own company staff"
ON staff
FOR UPDATE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_super_admin()
)
WITH CHECK (
  company_id = auth.user_company_id() 
  OR auth.is_super_admin()
);

-- Allow SuperAdmins to DELETE staff for ANY company
DROP POLICY IF EXISTS "Users delete own company staff" ON staff;
CREATE POLICY "Users delete own company staff"
ON staff
FOR DELETE
USING (
  company_id = auth.user_company_id() 
  OR auth.is_super_admin()
);

-- Allow SuperAdmins to SELECT staff for ANY company
DROP POLICY IF EXISTS "Users see own company staff" ON staff;
CREATE POLICY "Users see own company staff"
ON staff
FOR SELECT
USING (
  company_id = auth.user_company_id() 
  OR auth.is_super_admin()
);
