-- Script to deploy/update the staff authentication system
-- Run this in Supabase SQL Editor if the trigger is not set up

-- 1. Ensure staff table has auth_id column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'staff' 
          AND column_name = 'auth_id'
    ) THEN
        ALTER TABLE public.staff ADD COLUMN auth_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added auth_id column to staff table';
    ELSE
        RAISE NOTICE 'auth_id column already exists';
    END IF;
END $$;

-- 2. Create or replace the linking function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a staff profile exists with this email
  UPDATE public.staff
  SET auth_id = NEW.id
  WHERE email = NEW.email AND auth_id IS NULL;
  
  -- Log the action
  RAISE NOTICE 'New auth user created: %, linked to staff with email: %', NEW.id, NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.staff TO authenticated;

-- 6. Verify the setup
SELECT 'Trigger setup completed successfully!' as status;

-- 7. Show the trigger details
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
