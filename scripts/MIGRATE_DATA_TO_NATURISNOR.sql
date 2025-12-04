-- ============================================================
-- MIGRAÇÃO: Atribuir todos os dados existentes à Agencia Naturisnor
-- ============================================================

-- IMPORTANTE: Execute este script APENAS UMA VEZ!
-- Ele vai atribuir TODOS os dados às empresas corretas.

-- 1. Primeiro, vamos identificar o ID da empresa Naturisnor
DO $$
DECLARE
    naturisnor_company_id uuid;
BEGIN
    -- Buscar ID da Agencia Naturisnor
    SELECT id INTO naturisnor_company_id
    FROM company_settings
    WHERE name = 'Agencia  Naturisnor'  -- Note o espaço duplo
    LIMIT 1;

    IF naturisnor_company_id IS NULL THEN
        RAISE EXCEPTION 'Empresa Agencia Naturisnor não encontrada!';
    END IF;

    RAISE NOTICE 'ID da Agencia Naturisnor: %', naturisnor_company_id;

    -- 2. Atualizar bookings (se a coluna company_id existir)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'company_id'
    ) THEN
        UPDATE bookings
        SET company_id = naturisnor_company_id
        WHERE company_id IS NULL;
        
        RAISE NOTICE 'Bookings atualizadas: %', (SELECT COUNT(*) FROM bookings WHERE company_id = naturisnor_company_id);
    ELSE
        RAISE NOTICE 'Tabela bookings não tem coluna company_id. Pode precisar adicionar.';
    END IF;

    -- 3. Atualizar adventures
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'adventures' AND column_name = 'company_id'
    ) THEN
        UPDATE adventures
        SET company_id = naturisnor_company_id
        WHERE company_id IS NULL;
        
        RAISE NOTICE 'Adventures atualizadas: %', (SELECT COUNT(*) FROM adventures WHERE company_id = naturisnor_company_id);
    ELSE
        RAISE NOTICE 'Tabela adventures não tem coluna company_id. Pode precisar adicionar.';
    END IF;

    -- 4. Atualizar agencies
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agencies' AND column_name = 'company_id'
    ) THEN
        UPDATE agencies
        SET company_id = naturisnor_company_id
        WHERE company_id IS NULL;
        
        RAISE NOTICE 'Agencies atualizadas: %', (SELECT COUNT(*) FROM agencies WHERE company_id = naturisnor_company_id);
    ELSE
        RAISE NOTICE 'Tabela agencies não tem coluna company_id. Pode precisar adicionar.';
    END IF;

    -- 5. Atualizar clients (se existir)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'company_id'
    ) THEN
        UPDATE clients
        SET company_id = naturisnor_company_id
        WHERE company_id IS NULL;
        
        RAISE NOTICE 'Clients atualizados: %', (SELECT COUNT(*) FROM clients WHERE company_id = naturisnor_company_id);
    END IF;

END $$;

-- Verificar resultados
SELECT 
    'bookings' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as with_company
FROM bookings
UNION ALL
SELECT 
    'adventures',
    COUNT(*),
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END)
FROM adventures
UNION ALL
SELECT 
    'agencies',
    COUNT(*),
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END)
FROM agencies;
