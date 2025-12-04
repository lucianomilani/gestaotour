-- ============================================================
-- PROTECT: Impedir que o SuperAdmin seja apagado
-- ============================================================
-- Este script cria uma "trava" de segurança no banco de dados.
-- Mesmo que alguém tente apagar pelo painel do Supabase, vai dar erro.
--
-- Emails protegidos:
-- 1. tecnico@techx.pt
-- 2. info6@milani.link
-- ============================================================

-- 1. Função que verifica o email antes de apagar
CREATE OR REPLACE FUNCTION public.prevent_superadmin_deletion()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Lista de emails intocáveis
    IF OLD.email IN ('tecnico@techx.pt', 'info6@milani.link') THEN
        RAISE EXCEPTION '⛔ ERRO CRÍTICO: É proibido apagar o SuperAdmin (%)!', OLD.email;
    END IF;
    
    RETURN OLD;
END;
$$;

-- 2. Criar o Trigger na tabela auth.users
DROP TRIGGER IF EXISTS check_superadmin_deletion ON auth.users;

CREATE TRIGGER check_superadmin_deletion
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_superadmin_deletion();

RAISE NOTICE 'Proteção contra exclusão de SuperAdmin ativada com sucesso!';
