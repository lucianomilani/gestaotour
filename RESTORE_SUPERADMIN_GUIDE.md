# 🚨 GUIA: Como Restaurar Acesso SuperAdmin

## Problema
Você está perdendo frequentemente o status de SuperAdmin (`tecnico@techx.pt`).

## Causa
O status `is_superadmin` está sendo resetado no banco de dados, fazendo com que o `AuthContext` perca as permissões de SuperAdmin.

---

## ✅ SOLUÇÃO RÁPIDA (2 minutos)

### Passo 1: Abra o SQL Editor do Supabase
🔗 **Link direto:** https://supabase.eletrotecnia.com/project/_/sql

### Passo 2: Copie e Cole este SQL

```sql
-- Restaurar SuperAdmin para tecnico@techx.pt
INSERT INTO staff (name, email, role, notes, is_active, is_superadmin, company_id)
VALUES (
    'Técnico TechX',
    'tecnico@techx.pt',
    'Administrador',
    'SuperAdmin - TechX Platform Administrator',
    true,
    true,
    1
)
ON CONFLICT (email) 
DO UPDATE SET
    is_superadmin = true,
    is_active = true,
    role = 'Administrador',
    notes = 'SuperAdmin - TechX Platform Administrator',
    updated_at = NOW();

-- Linkar ao auth.users
UPDATE staff
SET auth_id = (SELECT id FROM auth.users WHERE email = 'tecnico@techx.pt' LIMIT 1)
WHERE email = 'tecnico@techx.pt' 
AND (auth_id IS NULL OR auth_id NOT IN (SELECT id FROM auth.users));

-- Verificar
SELECT id, name, email, role, is_superadmin, is_active, company_id, auth_id
FROM staff 
WHERE email = 'tecnico@techx.pt';
```

### Passo 3: Execute
Clique em **"Run"** ou pressione `Ctrl+Enter`

### Passo 4: Atualize o Browser
1. Feche todas as abas da aplicação
2. Abra novamente
3. Faça login com `tecnico@techx.pt`

---

## 🔍 Por que isso acontece?

O problema pode estar em:

1. **Alguma migration ou script** está resetando o campo `is_superadmin`
2. **Algum código da aplicação** está atualizando a tabela `staff` sem preservar o flag
3. **RLS Policies** podem estar bloqueando a leitura correta

---

## 🛡️ SOLUÇÃO PERMANENTE

Para evitar que isso aconteça novamente, execute esta migration uma única vez:

### Arquivo: `supabase/migrations/ensure_superadmin_persistent.sql`

Esta migration já foi criada em: 
📄 `./supabase/migrations/ensure_superadmin_persistent.sql`

Ela cria um **trigger** que **impede remoção acidental** do status SuperAdmin.

Para aplicar, copie e cole o conteúdo deste arquivo no SQL Editor do Supabase.

---

## 📝 Arquivos de Ajuda Criados

1. **`scripts/RESTORE_SUPERADMIN.sql`** - SQL para copiar e colar
2. **`supabase/migrations/ensure_superadmin_persistent.sql`** - Migration com proteção
3. **`scripts/restore-superadmin.sh`** - Script bash (se tiver CLI local)

---

## 🔧 Debugging

Se o problema persistir, verifique:

### 1. Verificar estado atual no banco
```sql
SELECT id, name, email, role, is_superadmin, is_active, company_id, auth_id, created_at, updated_at
FROM staff 
WHERE email = 'tecnico@techx.pt';
```

### 2. Verificar user_metadata no auth.users
```sql
SELECT id, email, raw_user_meta_data
FROM auth.users 
WHERE email = 'tecnico@techx.pt';
```

### 3. Verificar histórico de updates (se houver audit log)
```sql
-- Se tiver tabela de audit/logs
SELECT * FROM audit_log 
WHERE table_name = 'staff' 
AND record_id = (SELECT id FROM staff WHERE email = 'tecnico@techx.pt')
ORDER BY created_at DESC
LIMIT 10;
```

---

## 💡 Dicas

- O `AuthContext.tsx` tem um whitelist hardcoded com `tecnico@techx.pt`, mas ele **ainda depende do banco de dados**
- Se você ver `[Auth] Staff profile found: { is_superadmin: false }` nos logs do console, significa que o banco está com valor errado
- Sempre verifique o console do browser para ver os logs de `[Auth]`

---

## 🆘 Suporte

Se nada funcionar, verifique:
1. Se você tem acesso de administrador ao Supabase
2. Se as RLS policies não estão bloqueando UPDATE na tabela `staff`
3. Se há alguma Edge Function ou Trigger interferindo
