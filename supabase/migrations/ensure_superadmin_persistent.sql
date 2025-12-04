-- Ensure SuperAdmin status is persistent for tecnico@techx.pt
-- This migration can be run multiple times safely

-- Step 1: Ensure the user exists in staff table with SuperAdmin privileges
DO $$
DECLARE
    company_uuid UUID;
BEGIN
    -- Get the first company UUID
    SELECT id INTO company_uuid FROM company_settings LIMIT 1;
    
    -- If no company exists, create one
    IF company_uuid IS NULL THEN
        INSERT INTO company_settings (company_name, is_active)
        VALUES ('TechX Platform', true)
        RETURNING id INTO company_uuid;
    END IF;

    -- Insert or update the SuperAdmin user
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
END $$;

-- Step 2: Link to auth.users if auth_id is missing
UPDATE staff
SET auth_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'tecnico@techx.pt'
    LIMIT 1
)
WHERE email = 'tecnico@techx.pt' 
AND (auth_id IS NULL OR auth_id NOT IN (SELECT id FROM auth.users));

-- Step 3: Create a trigger to prevent SuperAdmin flag from being removed
CREATE OR REPLACE FUNCTION prevent_superadmin_removal()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent removing SuperAdmin flag from tecnico@techx.pt
    IF OLD.email = 'tecnico@techx.pt' AND NEW.is_superadmin = false THEN
        RAISE EXCEPTION 'Cannot remove SuperAdmin status from tecnico@techx.pt';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_superadmin_status ON staff;
CREATE TRIGGER protect_superadmin_status
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION prevent_superadmin_removal();

-- Step 4: Verification - Show current status
SELECT 
    id,
    name,
    email,
    role,
    is_superadmin,
    is_active,
    company_id,
    auth_id,
    created_at,
    updated_at
FROM staff 
WHERE email = 'tecnico@techx.pt';
