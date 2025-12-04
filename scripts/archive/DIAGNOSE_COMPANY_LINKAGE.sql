-- ============================================================
-- DIAGNÓSTICO: Company ID do novo usuário
-- ============================================================

-- 1. Ver os últimos 3 usuários criados e suas empresas
SELECT 
    s.id as staff_id,
    s.name,
    s.email,
    s.company_id,
    cs.name as company_name,
    s.role,
    s.created_at
FROM public.staff s
LEFT JOIN public.company_settings cs ON s.company_id = cs.id
ORDER BY s.created_at DESC
LIMIT 3;

-- 2. Ver todas as empresas
SELECT 
    id,
    name,
    created_at
FROM public.company_settings
ORDER BY created_at DESC;
