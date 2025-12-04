-- Force update the user to be SuperAdmin in the database
-- This ensures the RPC function 'admin_create_user' allows them to execute it

UPDATE staff
SET 
    is_superadmin = true,
    role = 'Administrador',
    is_active = true
WHERE email = 'leonel.marcelino@techxpt.com';

-- Verify the update
SELECT * FROM staff WHERE email = 'leonel.marcelino@techxpt.com';
