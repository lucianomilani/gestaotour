-- ============================================================
-- FIX FINAL V3: Função admin_create_user (Correção confirmed_at)
-- ============================================================
-- Correção: Remove inserção direta em 'confirmed_at' (coluna gerada)
-- Mantém 'email_confirmed_at' que deve acionar a confirmação
-- ============================================================

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
  is_superadmin_flag boolean;
  new_user_id uuid;
  encrypted_pw text;
BEGIN
  -- 1. Check Permissions
  executing_user_id := auth.uid();
  
  -- Check if user exists in staff and has permissions
  SELECT (s.role = 'Administrador'), (s.is_superadmin = true)
  INTO is_admin, is_superadmin_flag
  FROM public.staff s
  WHERE s.auth_id = executing_user_id;

  -- If no staff record found, or not admin/superadmin
  IF is_admin IS NOT TRUE AND is_superadmin_flag IS NOT TRUE THEN
    RAISE EXCEPTION 'Access Denied: Only Administrators can create users. (User ID: %, Admin: %, SuperAdmin: %)', executing_user_id, is_admin, is_superadmin_flag;
  END IF;

  -- 2. Check if user already exists
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = new_email) THEN
    RAISE EXCEPTION 'User already exists with this email.';
  END IF;

  -- 3. Generate new UUID and encrypt password (Cost 10)
  new_user_id := gen_random_uuid();
  encrypted_pw := crypt(new_password, gen_salt('bf', 10));

  -- 4. Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    -- REMOVED: confirmed_at (generated column)
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    is_sso_user
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    new_email,
    encrypted_pw,
    now(),
    -- REMOVED: confirmed_at value
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('name', new_name, 'role', new_role),
    now(),
    now(),
    '',
    '',
    false
  );

  -- 5. Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    new_user_id::text,
    jsonb_build_object(
        'sub', new_user_id::text, 
        'email', new_email,
        'email_verified', false,
        'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_create_user TO authenticated;
