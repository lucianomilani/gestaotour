# Correção do Schema da Tabela Bookings

## Problema Identificado

A tabela `bookings` no Supabase estava com nomes de colunas diferentes dos esperados pelo código frontend, causando incompatibilidade.

## Diferenças Encontradas

| Schema Antigo | Código Frontend | Schema Corrigido |
|---------------|-----------------|------------------|
| `start_date` | `date` | `date` |
| `end_date` | *(não usado)* | *(removido)* |
| `participants_adults` | `adults` | `adults` |
| `participants_children` | `children` | `children` |
| `participants_babies` | `babies` | `babies` |
| `participants_total` | *(calculado)* | *(removido)* |
| `total_value` | `total_amount` | `total_amount` |
| *(não existia)* | `deposit_amount` | `deposit_amount` |

## Como Aplicar a Correção

### Opção 1: Executar Migration (Recomendado)

Execute o seguinte SQL no **Supabase SQL Editor**:

```sql
-- Renomear colunas de data
ALTER TABLE bookings RENAME COLUMN start_date TO date;
ALTER TABLE bookings DROP COLUMN IF EXISTS end_date;

-- Renomear colunas de participantes
ALTER TABLE bookings RENAME COLUMN participants_adults TO adults;
ALTER TABLE bookings RENAME COLUMN participants_children TO children;
ALTER TABLE bookings RENAME COLUMN participants_babies TO babies;
ALTER TABLE bookings DROP COLUMN IF EXISTS participants_total;

-- Renomear colunas financeiras
ALTER TABLE bookings RENAME COLUMN total_value TO total_amount;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
```

### Opção 2: Recriar a Tabela (Se não houver dados importantes)

Se a tabela estiver vazia ou você puder perder os dados:

1. Delete a tabela existente:
```sql
DROP TABLE IF EXISTS bookings CASCADE;
```

2. Execute o schema atualizado em `supabase/schema.sql`

## Arquivos Atualizados

1. ✅ **`supabase/schema.sql`** - Schema corrigido
2. ✅ **`supabase/migrations/align_bookings_schema.sql`** - Script de migração
3. ✅ **Código frontend** - Já estava correto

## Verificação

Após aplicar a migração, verifique se as colunas estão corretas:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;
```

Você deve ver:
- `date` (não `start_date`)
- `adults`, `children`, `babies` (não `participants_*`)
- `total_amount`, `deposit_amount` (não `total_value`)
- `google_calendar_link`

## Próximos Passos

Após aplicar a migração:
1. Execute `npm run build` para verificar se não há erros
2. Teste criar uma nova reserva
3. Verifique se os dados são salvos corretamente no Supabase
