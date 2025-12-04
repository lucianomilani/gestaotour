-- ============================================================
-- CRIAR OU ATUALIZAR SuperAdmin (Versão Definitiva)
-- ============================================================
-- Este script funciona se o usuário existe OU não existe
-- Ele pega automaticamente um company_id válido existente
--
-- Copie tudo e cole no Supabase SQL Editor:
-- https://supabase.eletrotecnia.com/project/_/sql
-- ============================================================

DO $$
DECLARE
    existing_company_uuid UUID;
    user_exists BOOLEAN;
BEGIN
    -- Verificar se o usuário já existe
    SELECT EXISTS(SELECT 1 FROM staff WHERE email = 'tecnico@techx.pt') INTO user_exists;
    
    -- Pegar uma empresa existente
    SELECT id INTO existing_company_uuid FROM company_settings LIMIT 1;
    
    -- Se não houver empresa, criar uma
    IF existing_company_uuid IS NULL THEN
        INSERT INTO company_settings (code, name, nif, email, phone, contact, address, postal_code, is_active)
        VALUES ('TECHX001', 'TechX Platform', '999999999', 'admin@techx.pt', '+351 000 000 000', 'TechX Admin', 'Lisboa', '1000-000', true)
        RETURNING id INTO existing_company_uuid;
        RAISE NOTICE 'Created new company with ID: %', existing_company_uuid;
    ELSE
        RAISE NOTICE 'Using existing company ID: %', existing_company_uuid;
    END IF;
    
    -- Se usuário existe, apenas atualizar
    IF user_exists THEN
        UPDATE staff
        SET 
            is_superadmin = true,
            is_active = true,
            role = 'Administrador',
            notes = 'SuperAdmin - TechX Platform Administrator',
            company_id = existing_company_uuid,
            updated_at = NOW()
        WHERE email = 'tecnico@techx.pt';
        RAISE NOTICE 'Updated existing user tecnico@techx.pt';
    ELSE
        -- Se não existe, criar novo
        INSERT INTO staff (name, email, role, notes, is_active, is_superadmin, company_id)
        VALUES (
            'Técnico TechX',
            'tecnico@techx.pt',
            'Administrador',
            'SuperAdmin - TechX Platform Administrator',
            true,
            true,
            existing_company_uuid
        );
        RAISE NOTICE 'Created new user tecnico@techx.pt';
    END IF;
    
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
    
    RAISE NOTICE 'SuperAdmin setup completed successfully!';
END $$;

-- Verificar resultado final
SELECT 
    s.id,
    s.name,
    s.email,
    s.role,
    s.is_superadmin,
    s.is_active,
    s.company_id,
    s.auth_id,
    c.name as company,
    CASE 
        WHEN s.auth_id IS NOT NULL THEN 'Linked to auth.users ✓'
        ELSE 'NOT linked to auth.users ✗'
    END as auth_status
FROM staff s
LEFT JOIN company_settings c ON s.company_id = c.id
WHERE s.email = 'tecnico@techx.pt';
