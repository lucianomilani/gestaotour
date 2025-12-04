-- Force update the CORRECT SuperAdmin user in the database
UPDATE staff
SET 
    is_superadmin = true,
    role = 'Administrador',
    is_active = true
WHERE email = 'tecnico@techx.pt';

-- Verify the update
SELECT * FROM staff WHERE email = 'tecnico@techx.pt';
