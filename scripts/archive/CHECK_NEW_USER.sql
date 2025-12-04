-- ============================================================
-- DIAGNÓSTICO: Verificar usuário info@milani.link
-- ============================================================

-- 1. Verificar se o usuário existe em auth.users
SELECT 
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'info@milani.link';

-- 2. Verificar se existe em auth.identities
SELECT 
    id,
    user_id,
    provider,
    provider_id,
    created_at
FROM auth.identities 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'info@milani.link');

-- 3. Verificar na tabela staff
SELECT 
    id,
    name,
    email,
    role,
    auth_id,
    company_id,
    is_active
FROM staff 
WHERE email = 'info@milani.link';
