-- ============================================================
-- FIX: Trigger para forçar company_id correto
-- ============================================================
-- O erro de RLS no INSERT acontece porque o company_id pode estar
-- chegando nulo ou incorreto do frontend.
-- Vamos criar um TRIGGER que preenche automaticamente o company_id
-- com a empresa do usuário logado ANTES da verificação de segurança.
-- ============================================================

-- 1. Função do Trigger
CREATE OR REPLACE FUNCTION public.trg_set_company_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Se não for SuperAdmin, força o company_id do usuário
    IF is_superadmin() IS NOT TRUE THEN
        NEW.company_id := user_company_id();
    END IF;
    
    -- Se for SuperAdmin e não enviou company_id, usa o dele (ou deixa nulo se quiser)
    -- Mas por segurança, vamos garantir que tenha um company_id se o campo for obrigatório
    IF NEW.company_id IS NULL AND is_superadmin() IS TRUE THEN
         NEW.company_id := user_company_id();
    END IF;

    RETURN NEW;
END;
$$;

-- 2. Criar Triggers para as tabelas
DROP TRIGGER IF EXISTS set_company_id_agencies ON agencies;
CREATE TRIGGER set_company_id_agencies
    BEFORE INSERT ON agencies
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_company_id();

DROP TRIGGER IF EXISTS set_company_id_payment_methods ON payment_methods;
CREATE TRIGGER set_company_id_payment_methods
    BEFORE INSERT ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_company_id();

DROP TRIGGER IF EXISTS set_company_id_bookings ON bookings;
CREATE TRIGGER set_company_id_bookings
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_company_id();

DROP TRIGGER IF EXISTS set_company_id_adventures ON adventures;
CREATE TRIGGER set_company_id_adventures
    BEFORE INSERT ON adventures
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_company_id();

-- Verificar
SELECT event_object_table, trigger_name 
FROM information_schema.triggers 
WHERE trigger_name LIKE 'set_company_id_%';
