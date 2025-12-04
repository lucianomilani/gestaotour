-- ============================================================
-- RPC: admin_fix_new_user
-- ============================================================
-- Função para "consertar" e confirmar um usuário recém-criado
-- via signUp público, garantindo que ele tenha permissões corretas.
-- ============================================================

CREATE OR REPLACE FUNCTION admin_fix_new_user(
    target_user_id uuid,
    new_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth
AS $$
DECLARE
  executing_user_id uuid;
  is_admin boolean;
  is_superadmin_flag boolean;
BEGIN
  -- 1. Check Permissions (Only Admins can run this)
  executing_user_id := auth.uid();
  
  SELECT (s.role = 'Administrador'), (s.is_superadmin = true)
  INTO is_admin, is_superadmin_flag
  FROM public.staff s
  WHERE s.auth_id = executing_user_id;

  IF is_admin IS NOT TRUE AND is_superadmin_flag IS NOT TRUE THEN
    RAISE EXCEPTION 'Access Denied: Only Administrators can finalize users.';
  END IF;

  -- 2. Confirm Email (Force confirmation)
  UPDATE auth.users
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    -- confirmed_at is generated, so we rely on email_confirmed_at
    raw_user_meta_data = raw_user_meta_data || '{"email_verified": true}'::jsonb
  WHERE id = target_user_id;

  -- 3. Update Staff Role (Trigger should have already linked it)
  -- We ensure the role is set correctly in staff
  UPDATE public.staff
  SET 
    role = new_role,
    is_active = true
  WHERE auth_id = target_user_id;

END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION admin_fix_new_user TO authenticated;
