# Debug Guide - Problemas de Autenticação

## Problema: Loading Infinito / Círculo Rodando

### Causas Corrigidas

✅ **Timeout em queries do banco** - Adicionado timeout de 5s
✅ **Error handling** - Try-catch-finally garantem que loading sempre termina
✅ **Sessão persistente** - Configuração explícita do localStorage
✅ **Conta inativa** - Detecção e logout automático

### Como Testar a Correção

1. **Limpar dados antigos:**
   ```javascript
   // Abrir Console do Browser (F12) e executar:
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Recarregar a página** (Ctrl+F5)

3. **Fazer login normalmente**

4. **Verificar que NÃO aparece mais o loading infinito**

### Se o Problema Persistir

#### 1. Verificar Console do Browser (F12)

Procure por mensagens:
- ❌ `Query timeout` → Problema de rede/RLS
- ❌ `Account is inactive` → Conta desativada na tabela staff
- ❌ `Staff profile query error` → RLS bloqueando acesso

#### 2. Verificar RLS Policies

No **Supabase Dashboard → Table Editor → staff → RLS**:

```sql
-- Deve ter policy como esta:
CREATE POLICY "Allow read access to authenticated users"
  ON public.staff FOR SELECT
  TO authenticated
  USING (true);
```

Se não tiver, execute:
```sql
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" 
ON public.staff FOR SELECT 
TO authenticated 
USING (true);
```

#### 3. Verificar Conectividade

```javascript
// No console do browser:
const { data, error } = await supabase.from('staff').select('*').limit(1);
console.log({ data, error });
```

Se retornar erro, o problema é no banco/RLS.

#### 4. Verificar Auth Session

```javascript
// No console do browser:
const { data: { session } } = await supabase.auth.getSession();
console.log(session);
```

Se retornar `null`, a sessão expirou.

### Melhorias Implementadas

1. **Timeout de 5 segundos** - Evita espera infinita
2. **Fallback para user_metadata** - Se banco falhar, usa dados do auth
3. **Mounted state check** - Previne memory leaks
4. **Try-catch-finally** - Garante que loading sempre termina
5. **Sessão persistente configurada** - localStorage com chave específica
6. **Auto-refresh token** - Renova token automaticamente

### Como Forçar Logout Manual

Se precisar resetar completamente:

```javascript
// Console do browser:
await supabase.auth.signOut();
localStorage.removeItem('gestaotour-auth');
window.location.reload();
```

### Monitoramento

Para debug contínuo, ative logs:

```javascript
// No início do App.tsx (temporário):
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth Event:', event, 'Session:', session);
});
```

Eventos esperados:
- `SIGNED_IN` - Ao fazer login
- `SIGNED_OUT` - Ao fazer logout  
- `TOKEN_REFRESHED` - Token renovado automaticamente
- `USER_UPDATED` - Dados do usuário atualizados
