-- ============================================================
-- FIX: Remover políticas conflitantes da tabela staff
-- ============================================================
-- As policies "Allow read/write access to authenticated users"
-- estão dando acesso total e ignorando a segregação por empresa.
-- ============================================================

-- REMOVER policies antigas/conflitantes da tabela STAFF
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON staff;
DROP POLICY IF EXISTS "Allow write access to authenticated users" ON staff;

-- Manter apenas as policies que filtram por company
-- (essas já foram criadas anteriormente)

-- VERIFICAR se ficou correto
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual = 'true' THEN '⚠️ PERMITE TUDO'
        ELSE '✅ Filtrado'
    END as tipo
FROM pg_policies
WHERE tablename = 'staff'
ORDER BY policyname;
