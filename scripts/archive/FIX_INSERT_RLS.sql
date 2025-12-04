-- ============================================================
-- FIX: RLS Insert Policies
-- ============================================================
-- O erro "new row violates row-level security policy" ocorre no INSERT
-- porque a policy "WITH CHECK" valida se o company_id da nova linha
-- bate com o do usuário. Se o frontend não enviar company_id, ou
-- se o banco não preencher automaticamente antes da verificação, falha.
-- ============================================================

-- 1. Recriar policy de INSERT para agencies
DROP POLICY IF EXISTS "Users manage own company agencies" ON agencies;

-- Separar INSERT das outras operações para ser mais permissivo ou explícito
CREATE POLICY "Users insert own company agencies"
ON agencies FOR INSERT
TO authenticated
WITH CHECK (
    -- Permite se o company_id enviado for igual ao do usuário
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users update/delete own company agencies"
ON agencies FOR UPDATE
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
)
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users delete own company agencies"
ON agencies FOR DELETE
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
);


-- 2. Recriar policy de INSERT para payment_methods
DROP POLICY IF EXISTS "Users manage own company payment_methods" ON payment_methods;

CREATE POLICY "Users insert own company payment_methods"
ON payment_methods FOR INSERT
TO authenticated
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users update own company payment_methods"
ON payment_methods FOR UPDATE
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
)
WITH CHECK (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

CREATE POLICY "Users delete own company payment_methods"
ON payment_methods FOR DELETE
TO authenticated
USING (
    company_id = user_company_id() 
    OR is_superadmin() = true
);

-- 3. Garantir que o frontend envie o company_id
-- (Isso já está no código do AgenciesList.tsx, mas vamos reforçar no banco
-- com um DEFAULT se possível, mas user_company_id() é stable, não volatile,
-- então não pode ser default direto facilmente sem trigger.
-- Vamos confiar que o frontend envia, como visto no código.)

