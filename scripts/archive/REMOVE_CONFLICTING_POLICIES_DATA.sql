-- ============================================================
-- FIX: Remover políticas "Allow all" das tabelas de dados
-- ============================================================
-- Verificar se existem policies com qual = true que permitem
-- acesso total nas tabelas bookings, adventures, agencies
-- ============================================================

-- 1. Ver todas as policies atuais
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    CASE 
        WHEN qual = 'true' THEN '⚠️ PERMITE TUDO - REMOVER'
        ELSE '✅ OK - Filtrado'
    END as status
FROM pg_policies
WHERE tablename IN ('bookings', 'adventures', 'agencies', 'payments')
ORDER BY tablename, policyname;

-- 2. Se houver policies com qual = true, execute os comandos abaixo:
-- (Descomente as linhas necessárias)

-- DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bookings;
-- DROP POLICY IF EXISTS "Enable update for authenticated users only" ON bookings;
-- DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON bookings;

-- DROP POLICY IF EXISTS "Enable read access for all users" ON adventures;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON adventures;
-- DROP POLICY IF EXISTS "Enable update for authenticated users only" ON adventures;
-- DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON adventures;

-- DROP POLICY IF EXISTS "Enable read access for all users" ON agencies;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON agencies;
-- DROP POLICY IF EXISTS "Enable update for authenticated users only" ON agencies;
-- DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON agencies;

-- 3. Verificar novamente
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN ('bookings', 'adventures', 'agencies', 'payments')
ORDER BY tablename, policyname;
