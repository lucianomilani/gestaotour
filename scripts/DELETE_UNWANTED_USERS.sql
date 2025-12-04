-- ============================================================
-- DELETE: Apagar todos os usuários EXCETO os especificados
-- ============================================================
-- CUIDADO: Este script apaga usuários do sistema de autenticação!
--
-- Usuários mantidos:
-- 1. tecnico@techx.pt
-- 2. info6@milani.link
-- ============================================================

BEGIN;

-- 1. Apagar usuários que NÃO estão na lista de permitidos
DELETE FROM auth.users
WHERE email NOT IN (
    'tecnico@techx.pt',
    'info6@milani.link'
);

-- 2. Mostrar quantos sobraram (deve ser 2)
SELECT id, email, created_at 
FROM auth.users;

COMMIT;
