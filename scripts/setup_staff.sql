-- 1. Create Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('Administrador', 'Gestor', 'Guia', 'Condutor')),
  nif TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to authenticated users"
  ON public.staff FOR SELECT
  TO authenticated
  USING (true);

-- Allow write access to authenticated users (Simplification for demo)
CREATE POLICY "Allow write access to authenticated users"
  ON public.staff FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Create Function to Link Auth User to Staff Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a staff profile exists with this email
  UPDATE public.staff
  SET auth_id = NEW.id
  WHERE email = NEW.email;
  
  -- If no profile exists, we could optionally create one, but for now we assume Admin created it first
  -- or we just let it be.
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Insert existing Admin if not exists
INSERT INTO public.staff (name, email, role, notes)
VALUES ('Admin User', 'admin@naturisnor.com', 'Administrador', 'Conta de Administrador Padrão')
ON CONFLICT (email) DO NOTHING;
