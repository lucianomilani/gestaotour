-- ============================================================
-- VER CÓDIGO DAS FUNÇÕES RLS
-- ============================================================

-- Ver a função user_company_id()
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'user_company_id';

-- Ver a função is_superadmin()
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'is_superadmin';
