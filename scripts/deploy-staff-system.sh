#!/bin/bash

# Script de deployment do sistema de autenticação de equipa
# Este script automatiza o processo de deployment descrito no DEPLOYMENT_GUIDE.md

set -e  # Exit on error

echo "======================================"
echo "  Staff Auth System - Deployment"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI não está instalado${NC}"
    echo "Instale com: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✓${NC} Supabase CLI detectado"
echo ""

# Step 1: Check if logged in
echo "📋 Passo 1: Verificando login..."
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  Não está logado no Supabase"
    echo "Executando login..."
    supabase login
fi
echo -e "${GREEN}✓${NC} Login verificado"
echo ""

# Step 2: Check if project is linked
echo "📋 Passo 2: Verificando link do projeto..."
if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠${NC}  Projeto não está linkado"
    echo "Por favor, execute manualmente:"
    echo "  supabase link --project-ref <SEU_PROJECT_REF>"
    exit 1
fi
echo -e "${GREEN}✓${NC} Projeto linkado"
echo ""

# Step 3: Deploy Edge Function
echo "📋 Passo 3: Deploy da Edge Function..."
echo ""
echo -e "${YELLOW}Antes de continuar:${NC}"
echo "1. Certifique-se de que SUPABASE_SERVICE_ROLE_KEY está configurada"
echo "2. Acesse: Supabase Dashboard → Edge Functions → Manage secrets"
echo ""
read -p "SUPABASE_SERVICE_ROLE_KEY está configurada? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}❌ Configure o secret antes de continuar${NC}"
    echo ""
    echo "Execute manualmente:"
    echo "  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<SUA_KEY>"
    exit 1
fi

echo ""
echo "Fazendo deploy da função create-user..."
supabase functions deploy create-user

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Edge Function deployada com sucesso!"
else
    echo -e "${RED}❌ Erro ao fazer deploy da Edge Function${NC}"
    exit 1
fi
echo ""

# Step 4: List functions to verify
echo "📋 Passo 4: Verificando funções deployadas..."
supabase functions list
echo ""

# Step 5: Reminder about database trigger
echo "📋 Passo 5: Database Trigger"
echo ""
echo -e "${YELLOW}⚠${NC}  Ação manual necessária:"
echo "  1. Abra o Supabase Dashboard → SQL Editor"
echo "  2. Execute o script: scripts/verify-staff-auth.sql"
echo "  3. Se a trigger não existir, execute: scripts/deploy-staff-auth.sql"
echo ""

# Final checklist
echo "======================================"
echo "  Checklist de Deployment"
echo "======================================"
echo ""
echo "✅ Edge Function deployada"
echo "⏳ Database trigger (execute manualmente no SQL Editor)"
echo "⏳ Testes de integração"
echo ""
echo "Próximos passos:"
echo "1. Configure a trigger no SQL Editor"
echo "2. Teste criar um colaborador via UI"
echo "3. Verifique que o login funciona"
echo ""
echo -e "${GREEN}Deployment concluído!${NC}"
echo "Consulte DEPLOYMENT_GUIDE.md para mais detalhes."
