-- Script para verificar se os campos de capacidade existem na tabela adventures

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'adventures' 
    AND column_name IN ('min_capacity', 'max_capacity');

-- Se a tabela estiver vazia, os campos NÃO foram criados.
-- Se aparecerem 'min_capacity' e 'max_capacity', então SUCESSO.
