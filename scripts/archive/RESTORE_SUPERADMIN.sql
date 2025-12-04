-- ============================================================
-- RESTORE SUPERADMIN ACCESS FOR tecnico@techx.pt
-- ============================================================
-- 
-- INSTRUCTIONS:
-- 1. Copy all the SQL below (lines 10-60)
-- 2. Go to: https://supabase.eletrotecnia.com/project/_/sql
-- 3. Paste in the SQL Editor
-- 4. Click "Run" (or press Ctrl+Enter)
-- 5. Refresh your browser and log in again
--
-- ============================================================

-- First, get the company_id (UUID) from existing company
DO $$
DECLARE
    company_uuid UUID;
BEGIN
    -- Get the first company UUID, or use a default if none exists
    SELECT id INTO company_uuid FROM company_settings LIMIT 1;
    
    -- If no company exists, create one
    IF company_uuid IS NULL THEN
        INSERT INTO company_settings (company_name, is_active)
        VALUES ('TechX Platform', true)
        RETURNING id INTO company_uuid;
    END IF;

    -- Ensure the user exists in staff table with SuperAdmin privileges
    INSERT INTO staff (name, email, role, notes, is_active, is_superadmin, company_id)
    VALUES (
        'Técnico TechX',
        'tecnico@techx.pt',
        'Administrador',
        'SuperAdmin - TechX Platform Administrator',
        true,
        true,
        company_uuid
    )
    ON CONFLICT (email) 
    DO UPDATE SET
        is_superadmin = true,
        is_active = true,
        role = 'Administrador',
        notes = 'SuperAdmin - TechX Platform Administrator',
        company_id = company_uuid,
        updated_at = NOW();

    -- Link to auth.users if needed
    UPDATE staff
    SET auth_id = (
        SELECT id 
        FROM auth.users 
        WHERE email = 'tecnico@techx.pt'
        LIMIT 1
    )
    WHERE email = 'tecnico@techx.pt' 
    AND (auth_id IS NULL OR auth_id NOT IN (SELECT id FROM auth.users));
    
    RAISE NOTICE 'SuperAdmin restored successfully with company_id: %', company_uuid;
END $$;

-- Verify the update
SELECT 
    id,
    name,
    email,
    role,
    is_superadmin,
    is_active,
    company_id,
    auth_id,
    created_at
FROM staff 
WHERE email = 'tecnico@techx.pt';
