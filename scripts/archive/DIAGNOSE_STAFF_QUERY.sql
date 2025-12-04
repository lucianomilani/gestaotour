-- ============================================================
-- DIAGNÓSTICO: RLS Policies e Índices na tabela staff
-- ============================================================

-- 1. Ver as políticas RLS da tabela staff
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'staff';

-- 2. Ver os índices da tabela staff
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'staff';

-- 3. Testar a query manualmente (substituir o user_id)
-- Execute com EXPLAIN ANALYZE para ver o plano de execução
EXPLAIN ANALYZE
SELECT role, name, is_active, company_id, is_superadmin
FROM staff
WHERE auth_id = 'b653fcb9-509e-4549-b3da-8a3488cfd73d'  -- auth_id do info6
   OR email = 'info6@milani.link';
