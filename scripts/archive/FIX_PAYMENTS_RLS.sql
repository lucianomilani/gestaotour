-- ============================================================
-- FIX: RLS para tabela payments
-- ============================================================

-- 1. Ver policies atuais da tabela payments
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
WHERE tablename = 'payments';

-- 2. Habilitar RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 3. Remover policies conflitantes (se existirem)
DROP POLICY IF EXISTS "Enable all access for all users" ON payments;
DROP POLICY IF EXISTS "Enable read access for all users" ON payments;

-- 4. Criar policies corretas
-- Nota: payments deve filtrar pela empresa da BOOKING relacionada
DROP POLICY IF EXISTS "Users see own company payments" ON payments;
DROP POLICY IF EXISTS "Users manage own company payments" ON payments;

CREATE POLICY "Users see own company payments"
ON payments FOR SELECT
TO authenticated
USING (
    -- Se payment tem company_id direto
    (company_id = user_company_id() OR is_superadmin() = true)
    OR
    -- Se payment não tem company_id, mas tem booking_id
    (booking_id IN (
        SELECT id FROM bookings 
        WHERE company_id = user_company_id()
    ))
);

CREATE POLICY "Users manage own company payments"
ON payments FOR ALL
TO authenticated
USING (
    (company_id = user_company_id() OR is_superadmin() = true)
    OR
    (booking_id IN (
        SELECT id FROM bookings 
        WHERE company_id = user_company_id()
    ))
)
WITH CHECK (
    (company_id = user_company_id() OR is_superadmin() = true)
    OR
    (booking_id IN (
        SELECT id FROM bookings 
        WHERE company_id = user_company_id()
    ))
);

-- Verificar
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'payments'
ORDER BY policyname;
