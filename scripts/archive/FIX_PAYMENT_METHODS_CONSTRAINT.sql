-- ============================================================
-- FIX: Alterar constraint de payment_methods para suportar multi-empresa
-- ============================================================
-- Problema: O código (ex: "MULTIBANCO") precisa ser único globalmente,
-- mas agora cada empresa pode ter seus próprios métodos.
-- Solução: Tornar o código único apenas DENTRO da empresa.
-- ============================================================

-- 1. Remover constraint antigo (code único global)
ALTER TABLE payment_methods 
    DROP CONSTRAINT IF EXISTS payment_methods_code_key;

-- 2. Criar novo constraint (code único por empresa)
ALTER TABLE payment_methods 
    ADD CONSTRAINT payment_methods_code_company_unique 
    UNIQUE (code, company_id);

-- 3. Verificar
SELECT 
    conname as constraint_name,
    contype as type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'payment_methods'::regclass
AND contype IN ('u', 'p')
ORDER BY conname;
