-- ============================================================
-- SOLUÇÃO MAIS SIMPLES: Restaurar SuperAdmin sem criar empresa
-- ============================================================
-- Use este se você JÁ TEM empresas no banco de dados
--
-- Copie e cole no Supabase SQL Editor:
-- https://supabase.eletrotecnia.com/project/_/sql
-- ============================================================

-- Apenas atualizar o registro existente (não tenta inserir)
UPDATE staff
SET 
    is_superadmin = true,
    is_active = true,
    role = 'Administrador',
    notes = 'SuperAdmin - TechX Platform Administrator',
    updated_at = NOW()
WHERE email = 'tecnico@techx.pt';

-- Linkar ao auth.users se necessário
UPDATE staff
SET auth_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'tecnico@techx.pt'
    LIMIT 1
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
    auth_id
FROM staff 
WHERE email = 'tecnico@techx.pt';
