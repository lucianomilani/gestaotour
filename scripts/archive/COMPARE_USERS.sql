-- ============================================================
-- DIAGNÓSTICO COMPLETO: auth.users
-- ============================================================

-- 1. Ver TODOS os campos do usuário info@milani.link
SELECT * FROM auth.users WHERE email = 'info@milani.link';

-- 2. Comparar com um usuário que FUNCIONA (tecnico@techx.pt)
SELECT 
    email,
    encrypted_password,
    email_confirmed_at,
    confirmed_at,
    is_sso_user,
    banned_until,
    deleted_at
FROM auth.users 
WHERE email IN ('info@milani.link', 'tecnico@techx.pt');

-- 3. Verificar identities
SELECT * FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'info@milani.link'
);
