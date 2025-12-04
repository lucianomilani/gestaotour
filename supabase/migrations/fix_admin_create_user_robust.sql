-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Recreate the function with better search_path and type safety
CREATE OR REPLACE FUNCTION admin_create_user(
    new_email text,
    new_password text,
    new_name text,
    new_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  executing_user_id uuid;
  is_admin boolean;
  is_superadmin boolean;
  new_user_id uuid;
  encrypted_pw text;
BEGIN
  -- 1. Check Permissions
  executing_user_id := auth.uid();
  
  -- Check if user exists in staff and has permissions
  SELECT (s.role = 'Administrador'), (s.is_superadmin = true)
  INTO is_admin, is_superadmin
  FROM public.staff s
  WHERE s.auth_id = executing_user_id;

  -- If no staff record found, or not admin/superadmin
  IF is_admin IS NOT TRUE AND is_superadmin IS NOT TRUE THEN
    RAISE EXCEPTION 'Access Denied: Only Administrators can create users. (User ID: %, Admin: %, SuperAdmin: %)', executing_user_id, is_admin, is_superadmin;
  END IF;

  -- 2. Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
    RAISE EXCEPTION 'User already exists with this email.';
  END IF;

  -- 3. Generate new UUID and encrypt password
  new_user_id := gen_random_uuid();
  encrypted_pw := crypt(new_password, gen_salt('bf'));

  -- 4. Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    new_email,
    encrypted_pw,
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('name', new_name, 'role', new_role),
    now(),
    now(),
    '',
    ''
  );

  -- 5. Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id::text, -- Explicit cast to text
    new_user_id,
    jsonb_build_object('sub', new_user_id, 'email', new_email),
    'email',
    now(),
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_create_user TO authenticated;
