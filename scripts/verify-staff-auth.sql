-- Script to verify and setup the staff authentication system

-- 1. Verify if the staff table exists and has the correct structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'staff'
ORDER BY ordinal_position;

-- 2. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'on_auth_user_created';

-- 3. Check if the function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user';

-- 4. Verify RLS policies on staff table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'staff';

-- 5. Count staff members with and without auth_id
SELECT 
    COUNT(*) FILTER (WHERE auth_id IS NOT NULL) as with_login,
    COUNT(*) FILTER (WHERE auth_id IS NULL) as without_login,
    COUNT(*) as total
FROM public.staff;

-- 6. Show staff members and their auth status
SELECT 
    s.id,
    s.name,
    s.email,
    s.role,
    s.auth_id,
    u.email as auth_email,
    u.created_at as auth_created_at,
    CASE 
        WHEN s.auth_id IS NOT NULL THEN 'Linked'
        ELSE 'Not Linked'
    END as auth_status
FROM public.staff s
LEFT JOIN auth.users u ON s.auth_id = u.id
ORDER BY s.created_at DESC;
