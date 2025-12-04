-- Add is_superadmin flag to staff table for multi-tenant management
-- SuperAdmin users can access and manage all companies

ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false NOT NULL;

-- Create index for better performance when checking superadmin status
CREATE INDEX IF NOT EXISTS idx_staff_is_superadmin ON staff(is_superadmin);

-- Add comment
COMMENT ON COLUMN staff.is_superadmin IS 'Flag indicating if user is a SuperAdmin with access to all companies. SuperAdmins can create and manage multiple companies.';

-- Optional: Set the first admin user as superadmin
-- Uncomment and replace with your actual admin email
-- UPDATE staff 
-- SET is_superadmin = true 
-- WHERE email = 'admin@example.com' AND role = 'Administrador';
