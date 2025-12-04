-- ============================================================
-- TESTE DE CLONAGEM V3: Corrigido (Sem confirmed_at)
-- ============================================================

DO $$
DECLARE
    source_email text := 'manual@teste.com';
    target_email text := 'clone3@teste.com';
    new_uid uuid := gen_random_uuid();
    source_user record;
BEGIN
    -- 1. Buscar usuário fonte
    SELECT * INTO source_user FROM auth.users WHERE email = source_email;
    
    IF source_user.id IS NULL THEN
        RAISE EXCEPTION 'Usuário fonte % não encontrado', source_email;
    END IF;

    -- 2. Inserir clone em auth.users (Removido confirmed_at)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        -- confirmed_at removido (gerado automaticamente)
        recovery_token,
        email_change,
        phone,
        phone_change,
        phone_change_token,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        is_super_admin,
        created_at,
        updated_at,
        phone_confirmed_at,
        phone_change_sent_at,
        email_change_sent_at,
        is_sso_user,
        deleted_at,
        is_anonymous,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        source_user.instance_id,
        new_uid,
        source_user.aud,
        source_user.role,
        target_email,
        source_user.encrypted_password, -- Mesma senha hash
        now(), -- email_confirmed_at
        -- now(), -- confirmed_at removido
        source_user.recovery_token,
        source_user.email_change,
        null,
        source_user.phone_change,
        source_user.phone_change_token,
        source_user.email_change_confirm_status,
        source_user.banned_until,
        source_user.reauthentication_token,
        source_user.is_super_admin,
        now(),
        now(),
        source_user.phone_confirmed_at,
        source_user.phone_change_sent_at,
        source_user.email_change_sent_at,
        source_user.is_sso_user,
        source_user.deleted_at,
        source_user.is_anonymous,
        source_user.raw_app_meta_data,
        source_user.raw_user_meta_data
    );

    -- 3. Inserir identidade
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
        new_uid,
        new_uid::text,
        jsonb_build_object(
            'sub', new_uid::text,
            'email', target_email,
            'email_verified', false,
            'phone_verified', false
        ),
        'email',
        now(),
        now(),
        now()
    );

    RAISE NOTICE 'Usuário clone criado: % (Senha igual a %)', target_email, source_email;
END $$;
