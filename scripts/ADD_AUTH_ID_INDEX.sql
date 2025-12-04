-- ============================================================
-- FIX: Adicionar índice no auth_id
-- ============================================================
-- Isso pode resolver o problema de timeout ao buscar perfil do usuário

CREATE INDEX IF NOT EXISTS idx_staff_auth_id ON public.staff (auth_id);

-- Verificar se foi criado
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'staff' AND indexname = 'idx_staff_auth_id';
