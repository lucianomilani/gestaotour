-- ============================================================
-- RESTAURAR SUPERADMIN - Versão que SEMPRE funciona
-- ============================================================
-- A empresa já existe, só precisa corrigir o usuário
-- ============================================================

-- Atualizar o usuário para SuperAdmin
UPDATE staff
SET 
    is_superadmin = true,
    is_active = true,
    role = 'Administrador',
    notes = 'SuperAdmin - TechX Platform Administrator',
    updated_at = NOW()
WHERE email = 'tecnico@techx.pt';

-- Linkar ao auth.users (se ainda não estiver linkado)
UPDATE staff
SET auth_id = (
    SELECT id FROM auth.users WHERE email = 'tecnico@techx.pt' LIMIT 1
)
WHERE email = 'tecnico@techx.pt' 
AND (auth_id IS NULL OR auth_id NOT IN (SELECT id FROM auth.users));

-- Verificar resultado
SELECT 
    id,
    name,
    email,
    role,
    is_superadmin,
    is_active,
    company_id,
    auth_id,
    CASE 
        WHEN auth_id IS NOT NULL THEN 'Linked ✓'
        ELSE 'NOT linked ✗'
    END as status
FROM staff 
WHERE email = 'tecnico@techx.pt';
