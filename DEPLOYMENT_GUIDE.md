# Guia de Deployment (VPS & Supabase)

Este guia cobre o deployment da aplicação em uma VPS e a configuração dos serviços Supabase.

## Parte 1: Configuração do Supabase (Faça isso primeiro)

O projeto agora tem o Supabase CLI incluído nas dependências. Não é necessário instalar nada globalmente.

### 1. Login e Link

Execute no terminal do projeto:

```bash
# Login no Supabase (abrirá o navegador)
npm run supabase:login

# Linkar ao projeto remoto
# Pegue o Reference ID em: Dashboard -> Project Settings -> General
npm run supabase:link -- --project-ref <SEU_PROJECT_REF>
```

### 2. Configurar Secrets

A Edge Function precisa da chave de serviço para criar usuários.

```bash
# Opção A: Via Dashboard (Mais fácil)
# Vá em Edge Functions -> Manage Secrets -> Add new secret
# Name: SUPABASE_SERVICE_ROLE_KEY
# Value: (Pegue em Project Settings -> API -> service_role)

# Opção B: Via CLI
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<SUA_CHAVE_SERVICE_ROLE>
```

### 3. Deploy da Edge Function

```bash
npm run deploy:functions
```

### 4. Configurar Banco de Dados

No **Supabase Dashboard -> SQL Editor**, execute o script de verificação e setup:
1. Abra `scripts/verify-staff-auth.sql` e execute.
2. Se necessário, execute `scripts/deploy-staff-auth.sql`.

---

## Parte 2: Deployment na VPS

Para hospedar o frontend (React/Vite) na sua VPS.

### Pré-requisitos na VPS
- Node.js 18+ instalado
- Servidor Web (Nginx ou Apache)

### Passo 1: Preparar o Build

Na sua máquina local ou na VPS (se clonar o repo lá):

```bash
# Instalar dependências
npm install

# Criar versão de produção
npm run build
```

Isso criará uma pasta `dist/` com os arquivos estáticos otimizados.

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto na VPS (ou configure no seu servidor web/CI):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-publica
```

**Nota:** Como é um build estático, as variáveis `VITE_` são "injetadas" no código durante o comando `npm run build`. Se mudar as variáveis, precisa rodar o build novamente.

### Passo 3: Configurar Nginx (Exemplo)

Aponte o servidor para a pasta `dist/`.

```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/gestaotour/dist;
    index index.html;

    # Importante para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Passo 4: Atualizações Futuras

Para atualizar a aplicação na VPS:

1. `git pull`
2. `npm install` (se mudou dependências)
3. `npm run build`
4. Reiniciar Nginx (geralmente não precisa, mas bom para limpar cache)

---

## Resumo dos Comandos NPM

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor local de desenvolvimento |
| `npm run build` | Gera arquivos estáticos para produção em `/dist` |
| `npm run deploy:functions` | Faz deploy da Edge Function `create-user` |
| `npm run supabase:login` | Login no CLI do Supabase |
| `npm run supabase:link` | Linka projeto local ao projeto remoto |
