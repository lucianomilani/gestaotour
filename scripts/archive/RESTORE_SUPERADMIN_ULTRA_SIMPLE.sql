-- ============================================================
-- VERSÃO ULTRA SIMPLES - Apenas restaura SuperAdmin
-- ============================================================
-- Esta versão NÃO cria empresa, apenas usa uma existente
-- Se não houver empresa, deixa company_id como está
--
-- Copie e cole no Supabase SQL Editor:
-- https://supabase.eletrotecnia.com/project/_/sql
-- ============================================================

-- Opção 1: Se o usuário JÁ EXISTE na tabela staff
UPDATE staff
SET 
    is_superadmin = true,
    is_active = true,
    role = 'Administrador',
    updated_at = NOW()
WHERE email = 'tecnico@techx.pt';

-- Linkar ao auth.users
UPDATE staff
SET auth_id = (
    SELECT id FROM auth.users WHERE email = 'tecnico@techx.pt' LIMIT 1
)
WHERE email = 'tecnico@techx.pt' 
AND auth_id IS NULL;

-- Ver resultado
SELECT 
    id,
    name,
    email,
    role,
    is_superadmin,
    is_active,
    company_id,
    auth_id
FROM staff 
WHERE email = 'tecnico@techx.pt';
