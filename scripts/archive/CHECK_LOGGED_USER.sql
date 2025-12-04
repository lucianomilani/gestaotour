-- ============================================================
-- TESTE: Ver o que o AuthContext está pegando para um user específico
-- ============================================================
-- Execute isso e me diga qual email você está logado atualmente

-- Substitua o email abaixo pelo email do usuário que está logado
-- e vendo dados errados
SELECT 
    'Dados do usuário logado:' as info,
    s.email,
    s.name,
    s.role,
    s.company_id,
    cs.name as company_name,
    s.is_superadmin,
    s.is_active,
    s.auth_id
FROM public.staff s
LEFT JOIN public.company_settings cs ON s.company_id = cs.id
WHERE s.email = 'info6@milani.link'  -- <-- COLOQUE AQUI O EMAIL DO USUÁRIO LOGADO
OR s.email = 'tecnico@techx.pt'; -- Manter tecnico para comparação
