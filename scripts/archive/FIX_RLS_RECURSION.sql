-- ============================================================
-- FIX: Reescrever funções RLS com STABLE (Cache)
-- ============================================================
-- Isso evita a recursão infinita marcando as funções como "cacheáveis"
-- durante a execução de uma query.
-- ============================================================

-- 1. Recriar is_superadmin() com STABLE
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(is_superadmin, false) 
  FROM staff 
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$;

-- 2. Recriar user_company_id() com STABLE
CREATE OR REPLACE FUNCTION user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id 
  FROM staff 
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_superadmin() TO authenticated;
GRANT EXECUTE ON FUNCTION user_company_id() TO authenticated;

-- Verificar se foram atualizadas
SELECT 
    proname as function_name,
    provolatile as volatility,  -- 's' = STABLE, 'i' = IMMUTABLE, 'v' = VOLATILE
    prosecdef as security_definer
FROM pg_proc 
WHERE proname IN ('is_superadmin', 'user_company_id');
