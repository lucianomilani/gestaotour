/**
 * Script to restore SuperAdmin status via Supabase SQL Editor
 * 
 * INSTRUCTIONS:
 * 1. Go to: https://supabase.eletrotecnia.com/project/_/sql
 * 2. Create a new query
 * 3. Copy and paste the SQL below
 * 4. Click "Run" or press Ctrl+Enter
 * 5. Refresh your browser and log in again
 */

const SQL_TO_RUN = `
-- ============================================================
-- RESTORE SUPERADMIN ACCESS
-- ============================================================

-- Step 1: Ensure the user exists in staff table with SuperAdmin privileges
INSERT INTO staff (name, email, role, notes, is_active, is_superadmin, company_id)
VALUES (
    'Técnico TechX',
    'tecnico@techx.pt',
    'Administrador',
    'SuperAdmin - TechX Platform Administrator',
    true,
    true,
    1
)
ON CONFLICT (email) 
DO UPDATE SET
    is_superadmin = true,
    is_active = true,
    role = 'Administrador',
    notes = 'SuperAdmin - TechX Platform Administrator',
    updated_at = NOW();

-- Step 2: Link to auth.users if needed
UPDATE staff
SET auth_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'tecnico@techx.pt'
    LIMIT 1
)
WHERE email = 'tecnico@techx.pt' 
AND (auth_id IS NULL OR auth_id NOT IN (SELECT id FROM auth.users));

-- Step 3: Verify - Show current status
SELECT 
    id,
    name,
    email,
    role,
    is_superadmin,
    is_active,
    company_id,
    auth_id
FROM staff 
WHERE email = 'tecnico@techx.pt';
`;

console.log("📋 COPY THIS SQL AND RUN IT IN SUPABASE SQL EDITOR:");
console.log("=".repeat(60));
console.log(SQL_TO_RUN);
console.log("=".repeat(60));
console.log("");
console.log("🔗 Go to: https://supabase.eletrotecnia.com/project/_/sql");
