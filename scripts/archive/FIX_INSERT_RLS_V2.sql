-- ============================================================
-- FIX FINAL: Limpar e recriar policies de INSERT
-- ============================================================

-- 1. Limpar policies antigas de agencies
DROP POLICY IF EXISTS "Users insert own company agencies" ON agencies;
DROP POLICY IF EXISTS "Users update/delete own company agencies" ON agencies;
DROP POLICY IF EXISTS "Users delete own company agencies" ON agencies;
DROP POLICY IF EXISTS "Users manage own company agencies" ON agencies;

-- 2. Recriar policies de agencies
CREATE POLICY "Users insert own company agencies"
ON agencies FOR INSERT
TO authenticated
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users update own company agencies"
ON agencies FOR UPDATE
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
)
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users delete own company agencies"
ON agencies FOR DELETE
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

-- 3. Limpar policies antigas de payment_methods
DROP POLICY IF EXISTS "Users insert own company payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Users update own company payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Users delete own company payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Users manage own company payment_methods" ON payment_methods;

-- 4. Recriar policies de payment_methods
CREATE POLICY "Users insert own company payment_methods"
ON payment_methods FOR INSERT
TO authenticated
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users update own company payment_methods"
ON payment_methods FOR UPDATE
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
)
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users delete own company payment_methods"
ON payment_methods FOR DELETE
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
);
