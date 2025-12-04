-- ============================================================
-- DIAGNÓSTICO E FIX: RLS para company_settings
-- ============================================================

-- 1. Ver policies atuais
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    CASE 
        WHEN qual = 'true' THEN '⚠️ PERMITE TUDO'
        ELSE '✅ Filtrado'
    END as status
FROM pg_policies
WHERE tablename = 'company_settings';

-- 2. Habilitar RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- 3. Remover policies conflitantes
DROP POLICY IF EXISTS "Enable all access for all users" ON company_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON company_settings;

-- 4. Criar policies corretas
DROP POLICY IF EXISTS "Users see own company settings" ON company_settings;
DROP POLICY IF EXISTS "Users manage own company settings" ON company_settings;
DROP POLICY IF EXISTS "SuperAdmin can create companies" ON company_settings;

-- SELECT: Ver apenas a própria empresa (ou todas se SuperAdmin)
CREATE POLICY "Users see own company settings"
ON company_settings FOR SELECT
TO authenticated
USING (
    id = user_company_id() 
    OR is_superadmin() = true
);

-- UPDATE: Atualizar apenas a própria empresa (ou qualquer se SuperAdmin)
CREATE POLICY "Users manage own company settings"
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

-- INSERT: Apenas SuperAdmin pode criar novas empresas
CREATE POLICY "SuperAdmin can create companies"
ON company_settings FOR INSERT
TO authenticated
WITH CHECK (
    is_superadmin() = true
);

-- DELETE: Apenas SuperAdmin pode deletar empresas
CREATE POLICY "SuperAdmin can delete companies"
ON company_settings FOR DELETE
TO authenticated
USING (
    is_superadmin() = true
);

-- Verificar
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'company_settings'
ORDER BY policyname;
