-- ============================================================
-- FIX: Linkar tecnico@techx.pt corretamente
-- ============================================================

-- Passo 1: Verificar o estado atual
SELECT 
    'AUTH.USERS' as tabela,
    id as auth_id,
    email
FROM auth.users 
WHERE email = 'tecnico@techx.pt';

SELECT 
    'STAFF' as tabela,
    id,
    name,
    email,
    auth_id,
    is_superadmin,
    is_active,
    company_id
FROM staff 
WHERE email = 'tecnico@techx.pt';

-- Passo 2: Linkar o auth_id corretamente
UPDATE staff
SET auth_id = (
    SELECT id FROM auth.users WHERE email = 'tecnico@techx.pt' LIMIT 1
)
WHERE email = 'tecnico@techx.pt';

-- Passo 3: Garantir SuperAdmin
UPDATE staff
SET 
    is_superadmin = true,
    is_active = true,
    role = 'Administrador'
WHERE email = 'tecnico@techx.pt';

-- Passo 4: Verificar resultado final
SELECT 
    s.id,
    s.name,
    s.email,
    s.role,
    s.is_superadmin,
    s.is_active,
    s.auth_id,
    u.email as auth_email,
    CASE 
        WHEN s.auth_id IS NOT NULL AND s.auth_id = u.id THEN '✅ LINKED CORRECTLY'
        WHEN s.auth_id IS NULL THEN '❌ auth_id is NULL'
        ELSE '⚠️ auth_id mismatch'
    END as status
FROM staff s
LEFT JOIN auth.users u ON s.auth_id = u.id
WHERE s.email = 'tecnico@techx.pt';
