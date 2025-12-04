-- ============================================================
-- FIX: Adicionar RLS Policies para Multi-Empresa
-- ============================================================
-- Este script adiciona políticas de segurança (RLS) para que cada
-- empresa veja apenas seus próprios dados.
-- ============================================================

-- 1. HABILITAR RLS nas tabelas (se ainda não estiver)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER policies antigas (se existirem)
DROP POLICY IF EXISTS "Users see own company bookings" ON bookings;
DROP POLICY IF EXISTS "Users manage own company bookings" ON bookings;
DROP POLICY IF EXISTS "Users see own company adventures" ON adventures;
DROP POLICY IF EXISTS "Users manage own company adventures" ON adventures;
DROP POLICY IF EXISTS "Users see own company agencies" ON agencies;
DROP POLICY IF EXISTS "Users manage own company agencies" ON agencies;

-- 3. CRIAR POLICIES PARA BOOKINGS
-- SELECT: Ver apenas reservas da própria empresa (ou todas se SuperAdmin)
CREATE POLICY "Users see own company bookings"
ON bookings FOR SELECT
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

-- INSERT/UPDATE/DELETE: Gerenciar apenas da própria empresa
CREATE POLICY "Users manage own company bookings"
ON bookings FOR ALL
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
)
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

-- 4. CRIAR POLICIES PARA ADVENTURES
CREATE POLICY "Users see own company adventures"
ON adventures FOR SELECT
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users manage own company adventures"
ON adventures FOR ALL
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
)
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

-- 5. CRIAR POLICIES PARA AGENCIES
CREATE POLICY "Users see own company agencies"
ON agencies FOR SELECT
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users manage own company agencies"
ON agencies FOR ALL
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
)
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

-- Verificar se as policies foram criadas
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN ('bookings', 'adventures', 'agencies')
ORDER BY tablename, cmd;
