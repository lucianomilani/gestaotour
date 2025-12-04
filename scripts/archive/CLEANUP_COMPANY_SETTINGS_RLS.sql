-- ============================================================
-- FIX FINAL: Limpar policies conflitantes de company_settings
-- ============================================================

-- Remover TODAS as policies conflitantes
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON company_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON company_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON company_settings;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON company_settings;

-- Remover duplicadas com prefixo auth. (versões antigas)
DROP POLICY IF EXISTS "Users see own company settings" ON company_settings;
DROP POLICY IF EXISTS "Users update own company settings" ON company_settings;

-- Remover duplicadas de insert
DROP POLICY IF EXISTS "SuperAdmins insert companies" ON company_settings;

-- Recriar as corretas (sem prefixo auth.)
CREATE POLICY "Users see own company settings"
ON company_settings FOR SELECT
TO authenticated
USING (
    id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users update own company settings"
ON company_settings FOR UPDATE
TO authenticated
USING (
    id = user_company_id() 
    OR is_superadmin() = true
)
WITH CHECK (
    id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "SuperAdmin can delete companies"
ON company_settings FOR DELETE
TO authenticated
USING (
    is_superadmin() = true
);

-- Verificar resultado final
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual = 'true' THEN '⚠️ PROBLEMA'
        WHEN qual LIKE '%user_company_id%' OR qual LIKE '%is_superadmin%' THEN '✅ OK'
        ELSE qual
    END as status
FROM pg_policies
WHERE tablename = 'company_settings'
ORDER BY policyname;
