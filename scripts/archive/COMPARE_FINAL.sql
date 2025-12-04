-- ============================================================
-- DIAGNÓSTICO FINAL: Comparar Manual vs V5
-- ============================================================

SELECT 
    email,
    created_at,
    -- 1. Password Check
    encrypted_password IS NOT NULL as has_pwd,
    length(encrypted_password) as pwd_len,
    substr(encrypted_password, 1, 7) as pwd_prefix,
    
    -- 2. Confirmation Status
    email_confirmed_at,
    confirmed_at,
    
    -- 3. Metadata
    raw_app_meta_data,
    raw_user_meta_data,
    
    -- 4. Identity Data (Deep Check)
    (select count(*) from auth.identities where user_id = auth.users.id) as id_count,
    (select provider_id from auth.identities where user_id = auth.users.id limit 1) as provider_id,
    (select identity_data from auth.identities where user_id = auth.users.id limit 1) as identity_data,
    
    -- 5. Other Flags
    is_sso_user,
    aud,
    role,
    banned_until,
    instance_id
FROM auth.users 
WHERE email = 'manual@teste.com' 
   OR created_at = (SELECT max(created_at) FROM auth.users);
