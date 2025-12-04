-- ============================================================
-- FIX: Remover policies "Enable all access for all users"
-- ============================================================
-- Essas policies estão permitindo acesso total e ignorando
-- a segregação por empresa.
-- ============================================================

-- Remover policies conflitantes
DROP POLICY IF EXISTS "Enable all access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable all access for all users" ON adventures;
DROP POLICY IF EXISTS "Enable all access for all users" ON agencies;

-- Também remover policies antigas duplicadas (auth.user_company_id vs user_company_id)
-- Manter apenas as nossas (user_company_id)
DROP POLICY IF EXISTS "Users delete own company bookings" ON bookings;
DROP POLICY IF EXISTS "Users insert own company bookings" ON bookings;
DROP POLICY IF EXISTS "Users update own company bookings" ON bookings;

DROP POLICY IF EXISTS "Users delete own company adventures" ON adventures;
DROP POLICY IF EXISTS "Users insert own company adventures" ON adventures;
DROP POLICY IF EXISTS "Users update own company adventures" ON adventures;

DROP POLICY IF EXISTS "Users delete own company agencies" ON agencies;
DROP POLICY IF EXISTS "Users insert own company agencies" ON agencies;
DROP POLICY IF EXISTS "Users update own company agencies" ON agencies;

-- Verificar se ficou correto (só devem restar as policies "Users manage/see own company")
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual = 'true' THEN '⚠️ PROBLEMA - PERMITE TUDO'
        WHEN qual LIKE '%user_company_id%' THEN '✅ OK - Filtrado por empresa'
        ELSE '⚠️ VERIFICAR'
    END as status
FROM pg_policies
WHERE tablename IN ('bookings', 'adventures', 'agencies')
ORDER BY tablename, policyname;
