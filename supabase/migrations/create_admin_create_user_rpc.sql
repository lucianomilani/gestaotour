-- Create a secure function to create new users directly
-- This function is SECURITY DEFINER, allowing Admins to create users without logging in as them
CREATE OR REPLACE FUNCTION admin_create_user(
    new_email text,
    new_password text,
    new_name text,
    new_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  SELECT (role = 'Administrador'), (is_superadmin = true)
  INTO is_admin, is_superadmin
  FROM staff
  WHERE auth_id = executing_user_id;

  IF is_admin IS NOT TRUE AND is_superadmin IS NOT TRUE THEN
    RAISE EXCEPTION 'Access Denied: Only Administrators can create users.';
  END IF;

  -- 2. Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
    RAISE EXCEPTION 'User already exists with this email.';
  END IF;

  -- 3. Generate new UUID and encrypt password
  new_user_id := gen_random_uuid();
  encrypted_pw := crypt(new_password, gen_salt('bf'));

  -- 4. Insert into auth.users
  -- Note: We set email_confirmed_at to now() to auto-confirm
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
    '00000000-0000-0000-0000-000000000000', -- Default instance_id
    new_user_id,
    'authenticated',
    'authenticated',
    new_email,
    encrypted_pw,
    now(), -- Auto-confirm
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('name', new_name, 'role', new_role),
    now(),
    now(),
    '',
    ''
  );

  -- 5. Insert into auth.identities (Required for Supabase Auth to work properly)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
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
