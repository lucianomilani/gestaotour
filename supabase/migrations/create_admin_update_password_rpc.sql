-- Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a secure function to update user passwords
-- This function is SECURITY DEFINER, meaning it runs with the privileges of the creator (postgres)
-- We must carefully check permissions inside the function
CREATE OR REPLACE FUNCTION admin_update_password(target_user_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  executing_user_id uuid;
  is_admin boolean;
  is_superadmin boolean;
BEGIN
  -- Get the ID of the user executing the function
  executing_user_id := auth.uid();
  
  -- Check if the executing user is an Admin or SuperAdmin in the staff table
  SELECT 
    (role = 'Administrador'), 
    (is_superadmin = true)
  INTO 
    is_admin, 
    is_superadmin
  FROM staff
  WHERE auth_id = executing_user_id;

  -- If not admin/superadmin, raise exception
  IF is_admin IS NOT TRUE AND is_superadmin IS NOT TRUE THEN
    RAISE EXCEPTION 'Access Denied: Only Administrators can update passwords.';
  END IF;

  -- Update the user's password in the auth.users table
  -- We use the pgcrypto 'crypt' function to hash the password securely
  -- Note: Supabase auth uses bcrypt
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = target_user_id;

  -- Verify if any row was updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.';
  END IF;
END;
$$;
