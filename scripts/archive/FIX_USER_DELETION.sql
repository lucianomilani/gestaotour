-- ============================================================
-- FIX: Permitir apagar utilizadores do Auth
-- ============================================================
-- O erro "Failed to delete user" acontece porque a tabela public.staff
-- tem uma chave estrangeira (auth_id) apontando para auth.users.
-- Por padrão, o Postgres impede apagar o pai (auth.users) se existir um filho (staff).
--
-- Este script altera essa restrição para "ON DELETE SET NULL".
-- Assim, quando apagar o user no Auth, o colaborador continua existindo,
-- mas o campo auth_id fica NULL (aparece como "Sem Login").
-- ============================================================

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- 1. Descobrir o nome da constraint de foreign key do auth_id
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.staff'::regclass
    AND confrelid = 'auth.users'::regclass
    AND contype = 'f';

    -- 2. Se encontrar, remove e recria
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.staff DROP CONSTRAINT ' || constraint_name;
        
        EXECUTE 'ALTER TABLE public.staff 
                 ADD CONSTRAINT ' || constraint_name || ' 
                 FOREIGN KEY (auth_id) 
                 REFERENCES auth.users(id) 
                 ON DELETE SET NULL';
                 
        RAISE NOTICE 'Constraint % alterada para ON DELETE SET NULL', constraint_name;
    ELSE
        -- Se não encontrou pelo nome automático, tenta criar uma nova garantindo o nome
        RAISE NOTICE 'Constraint não encontrada automaticamente. Tentando recriar com nome padrão...';
        
        -- Tenta remover caso exista com nome padrão
        BEGIN
            ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_auth_id_fkey;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;

        ALTER TABLE public.staff 
        ADD CONSTRAINT staff_auth_id_fkey 
        FOREIGN KEY (auth_id) 
        REFERENCES auth.users(id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Nova constraint staff_auth_id_fkey criada com ON DELETE SET NULL';
    END IF;
END $$;

-- 3. Verificar se ficou correto
SELECT 
    conname as constraint_name,
    confdeltype as on_delete_action -- 'n' = set null, 'a' = no action (default), 'c' = cascade
FROM pg_constraint
WHERE conrelid = 'public.staff'::regclass
AND confrelid = 'auth.users'::regclass;
