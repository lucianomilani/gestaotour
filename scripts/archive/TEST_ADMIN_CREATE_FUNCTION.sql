-- ============================================================
-- TESTE: Função admin_create_user
-- ============================================================
-- Este script testa se a função está funcionando corretamente
-- Execute no Supabase SQL Editor
-- ============================================================

-- Teste 1: Verificar se a função existe
SELECT 
    proname as function_name,
    prokind as kind,
    proargnames as argument_names
FROM pg_proc 
WHERE proname = 'admin_create_user';

-- Teste 2: Testar criação de usuário (use um email que NÃO existe)
-- IMPORTANTE: Substitua 'teste@exemplo.com' por um email de teste
SELECT admin_create_user(
    'teste@exemplo.com',
    'senha123',
    'Usuário Teste',
    'Administrador'
);

-- Se der erro, você verá a mensagem específica aqui
