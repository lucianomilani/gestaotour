# Aplicar Migration de Capacidade dos Passeios

## Passo 1: Executar Migration na Base de Dados

1. Abra o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Cole e execute o conteúdo do arquivo:
   `supabase/migrations/add_adventure_capacity.sql`

Ou copie e cole este SQL:

```sql
-- Add capacity fields to adventures table
-- NULL = unlimited (infinite capacity)

ALTER TABLE adventures 
ADD COLUMN min_capacity INTEGER DEFAULT NULL,
ADD COLUMN max_capacity INTEGER DEFAULT NULL;

-- Add constraint: if both are set, min must be less than or equal to max
ALTER TABLE adventures
ADD CONSTRAINT check_capacity_range 
CHECK (
    (min_capacity IS NULL OR max_capacity IS NULL) OR 
    (min_capacity <= max_capacity)
);

-- Add comments for documentation
COMMENT ON COLUMN adventures.min_capacity IS 'Minimum number of participants required. NULL = no minimum.';
COMMENT ON COLUMN adventures.max_capacity IS 'Maximum number of participants allowed. NULL = unlimited.';
```

## Passo 2: Verificar Migration

Execute para confirmar que as colunas foram criadas:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'adventures' 
  AND column_name IN ('min_capacity', 'max_capacity');
```

Deve retornar:
```
column_name     | data_type | is_nullable | column_default
----------------|-----------|-------------|---------------
min_capacity    | integer   | YES         | NULL
max_capacity    | integer   | YES         | NULL
```

## Passo 3: Testar na Interface

1. Acesse a página de **Gestão de Passeios**
2. Clique em **Novo Passeio** ou edite um existente
3. Preencha a nova seção **Capacidade / Lotação**:
   - Deixe vazio = sem limite
   - Preencha apenas Máxima = limite superior sem mínimo
   - Preencha ambos = requer mínimo e limita máximo

## Lógica Implementada

### NULL = Infinito/Sem Limite

- `min_capacity = NULL` → Sem mínimo de participantes
- `max_capacity = NULL` → Sem limite máximo (infinito)

### Exemplos de Uso

**Passeio sem restrições:**
```
min_capacity: NULL (vazio)
max_capacity: NULL (vazio)
→ Aceita qualquer quantidade de pessoas
```

**Passeio com limite máximo:**
```
min_capacity: NULL (vazio)
max_capacity: 20
→ Aceita até 20 pessoas, sem mínimo
```

**Passeio com mínimo e máximo:**
```
min_capacity: 4
max_capacity: 12
→ Requer pelo menos 4 pessoas, aceita até 12
```

**Passeio com apenas mínimo:**
```
min_capacity: 2
max_capacity: NULL (vazio)
→ Requer pelo menos 2 pessoas, sem limite máximo
```

## Constraint de Validação

O banco valida automaticamente:
- Se ambos estão preenchidos: `min_capacity <= max_capacity`
- Se apenas um está preenchido: aceita
- Se ambos são NULL: aceita

**Exemplo de erro:**
```
min_capacity: 10
max_capacity: 5
→ ERRO: min_capacity deve ser menor ou igual a max_capacity
```

## Integração Futura

Estes campos podem ser utilizados para:
- ✅ Validar reservas antes de confirmar
- ✅ Mostrar "Lotado" quando atingir o máximo
- ✅ Avisar quando não atingir o mínimo
- ✅ Cálculo automático de disponibilidade
- ✅ Alertas de ocupação no dashboard
