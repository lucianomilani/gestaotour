-- ============================================================
-- DIAGNÓSTICO: Verificar se RLS está funcionando
-- ============================================================

-- 1. Testar as funções RLS manualmente
-- Execute isso LOGADO como info6@milani.link
SELECT 
    'user_company_id()' as function_name,
    user_company_id() as result;

SELECT 
    'is_superadmin()' as function_name,
    is_superadmin() as result;

-- 2. Ver todas as policies criadas
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('bookings', 'adventures', 'agencies', 'payments')
ORDER BY tablename, cmd;

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('bookings', 'adventures', 'agencies', 'payments');

-- 4. Testar query manual (simular o que o Supabase Client faz)
-- Execute LOGADO como info6@milani.link
SELECT COUNT(*) as total_bookings FROM bookings;
SELECT COUNT(*) as my_company_bookings FROM bookings WHERE company_id = user_company_id();
