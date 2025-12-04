-- Create staff profile and auth user for tecnico@techx.pt

-- 1. Insert staff profile
INSERT INTO public.staff (name, email, role, notes, is_active)
VALUES ('Técnico TechX', 'tecnico@techx.pt', 'Administrador', 'Conta de Administrador TechX', true)
ON CONFLICT (email) DO NOTHING;

-- 2. Note: You need to create the auth user manually or run the signup
-- The trigger will automatically link them when the auth user is created
