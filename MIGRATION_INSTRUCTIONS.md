# Instruções para Executar Migrações - Payment Methods

## Passo 1: Aceder ao Supabase SQL Editor

1. Abra o navegador e aceda a: **https://supabase.eletrotecnia.com**
2. Faça login se necessário
3. No menu lateral, clique em **"SQL Editor"**

---

## Passo 2: Criar a Tabela payment_methods

Copie e cole o seguinte SQL no editor e clique em **"Run"**:

```sql
-- Create Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Basic Information
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- API Integration Support
    api_config JSONB,
    
    -- UI Configuration
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods(is_active, display_order);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Enable read access for all users" ON payment_methods FOR SELECT USING (true);

-- Seed initial payment methods
INSERT INTO payment_methods (name, code, description, display_order, is_active) VALUES
    ('MBWay', 'mbway', 'Pagamento via MBWay', 1, true),
    ('Transferência Bancária', 'bank_transfer', 'Transferência bancária tradicional', 2, true),
    ('PayPal', 'paypal', 'Pagamento via PayPal', 3, true),
    ('Pagamento no Local', 'cash_on_site', 'Pagamento em dinheiro no local', 4, true)
ON CONFLICT (code) DO NOTHING;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_methods_updated_at();
```

✅ **Resultado esperado**: "Success. No rows returned"

---

## Passo 3: Atualizar a Tabela bookings

Copie e cole o seguinte SQL no editor e clique em **"Run"**:

```sql
-- Add payment_method_id column to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method_id);

-- Migrate existing data from payment_type to payment_method_id
UPDATE bookings b
SET payment_method_id = pm.id
FROM payment_methods pm
WHERE b.payment_type IS NOT NULL
  AND b.payment_method_id IS NULL
  AND (
    (b.payment_type = 'MBWay' AND pm.code = 'mbway') OR
    (b.payment_type = 'Transferência Bancária' AND pm.code = 'bank_transfer') OR
    (b.payment_type = 'PayPal' AND pm.code = 'paypal') OR
    (b.payment_type = 'Pagamento no Local' AND pm.code = 'cash_on_site')
  );

-- Set default for any remaining unmapped bookings
UPDATE bookings b
SET payment_method_id = (SELECT id FROM payment_methods WHERE code = 'bank_transfer' LIMIT 1)
WHERE payment_method_id IS NULL;
```

✅ **Resultado esperado**: Mensagem indicando quantas linhas foram atualizadas

---

## Passo 4: Verificar a Migração

Execute esta query para verificar:

```sql
-- Verificar payment methods criados
SELECT * FROM payment_methods ORDER BY display_order;

-- Verificar bookings migrados
SELECT id, client_name, payment_type, payment_method_id 
FROM bookings 
LIMIT 5;
```

✅ **Resultado esperado**: 
- 4 payment methods (MBWay, Transferência Bancária, PayPal, Pagamento no Local)
- Bookings com `payment_method_id` preenchido

---

## Passo 5: Testar a Aplicação

Após executar as migrações:

1. Recarregue a aplicação no navegador
2. Aceda ao formulário de reservas
3. Verifique se os meios de pagamento aparecem no dropdown
4. Aceda aos detalhes de uma reserva
5. Verifique se o campo "Método de Pagamento" aparece

---

## Em Caso de Erro

Se encontrar algum erro, copie a mensagem de erro completa e partilhe para ajudar a resolver.
