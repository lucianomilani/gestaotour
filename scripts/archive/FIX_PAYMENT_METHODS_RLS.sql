-- ============================================================
-- FIX: RLS para tabela payment_methods
-- ============================================================

-- 1. Ver policies atuais da tabela payment_methods
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    CASE 
        WHEN qual = 'true' THEN '⚠️ PERMITE TUDO - REMOVER'
        ELSE '✅ OK'
    END as status
FROM pg_policies
WHERE tablename = 'payment_methods';

-- 2. Habilitar RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- 3. Remover policies conflitantes (se existirem)
DROP POLICY IF EXISTS "Enable all access for all users" ON payment_methods;
DROP POLICY IF EXISTS "Enable read access for all users" ON payment_methods;

-- 4. Criar policies corretas
DROP POLICY IF EXISTS "Users see own company payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Users manage own company payment_methods" ON payment_methods;

CREATE POLICY "Users see own company payment_methods"
ON payment_methods FOR SELECT
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users manage own company payment_methods"
ON payment_methods FOR ALL
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
)
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

-- Verificar
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'payment_methods'
ORDER BY policyname;
