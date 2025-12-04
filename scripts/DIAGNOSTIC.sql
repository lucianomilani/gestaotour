-- ============================================================
-- DIAGNÓSTICO COMPLETO - Execute ANTES de restaurar
-- ============================================================
-- Este script mostra o estado atual do sistema
-- Use para entender qual é o problema
--
-- Copie e cole no Supabase SQL Editor:
-- https://supabase.eletrotecnia.com/project/_/sql
-- ============================================================

-- 1. Verificar se o usuário existe em auth.users
SELECT 
    '=== AUTH.USERS ===' as section,
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'tecnico@techx.pt';

-- 2. Verificar se o usuário existe em staff
SELECT 
    '=== STAFF ===' as section,
    id,
    name,
    email,
    role,
    is_superadmin,
    is_active,
    company_id,
    auth_id,
    created_at
FROM staff 
WHERE email = 'tecnico@techx.pt';

-- 3. Verificar empresas disponíveis
SELECT 
    '=== COMPANIES ===' as section,
    id,
    code,
    name,
    is_active
FROM company_settings
LIMIT 5;

-- 4. Verificar se há constraint de unique no email
SELECT 
    '=== CONSTRAINTS ===' as section,
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'staff'::regclass
AND contype IN ('u', 'p');

-- 5. Verificar políticas RLS na tabela staff
SELECT 
    '=== RLS POLICIES ===' as section,
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd as operation
FROM pg_policies 
WHERE tablename = 'staff'
ORDER BY policyname;
