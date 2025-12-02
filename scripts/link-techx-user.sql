-- Link the manually created auth user to the staff table

-- First, create the staff profile if it doesn't exist
INSERT INTO public.staff (name, email, role, notes, is_active)
VALUES ('Técnico TechX', 'tecnico@techx.pt', 'Administrador', 'Conta de Administrador TechX', true)
ON CONFLICT (email) DO NOTHING;

-- Then, link the auth user to the staff profile
UPDATE public.staff
SET auth_id = (SELECT id FROM auth.users WHERE email = 'tecnico@techx.pt')
WHERE email = 'tecnico@techx.pt';

-- Verify the link was created
SELECT s.name, s.email, s.role, s.auth_id, u.email as auth_email
FROM public.staff s
LEFT JOIN auth.users u ON s.auth_id = u.id
WHERE s.email = 'tecnico@techx.pt';
