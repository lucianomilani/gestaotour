<div align="center">
  <!-- Banner Conceitual -->
  <img width="1200" height="350" src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop" alt="GestãoTour Banner" style="border-radius: 12px; object-fit: cover;" />

  <br /> <br />

  # 🌍 GestãoTour
  
  **Plataforma Inteligente para Gestão de Turismo e Experiências**
  
  [![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?style=flat&logo=node.js)](https://nodejs.org/)
  [![AI Powered](https://img.shields.io/badge/AI-Gemini-blue?style=flat&logo=google-gemini)](https://ai.google.dev/)
  [![UI](https://img.shields.io/badge/Interface-Dark_Mode-black?style=flat&logo=vercel)]()
  [![Database](https://img.shields.io/badge/Supabase-Enabled-emerald?style=flat&logo=supabase)](https://supabase.com/)

  <p>
    <a href="https://ai.studio/apps/drive/1Q90Vp4q7NmqyltY9Rk4eshYc2iUKGlou">
      <b>🔗 Visualizar App no Google AI Studio</b>
    </a>
  </p>
</div>

---

## 📖 Visão Geral

O **GestãoTour** é uma solução "All-in-One" projetada para modernizar agências de turismo e organizadores de eventos. Focada em performance e UX (Experiência do Usuário), a plataforma substitui planilhas complexas por um **Dashboard Intuitivo** e um **Calendário Interativo**.

O sistema utiliza Inteligência Artificial para auxiliar na tomada de decisão, monitoramento de receita e gestão de capacidade.

---

## 🖥️ Tour pela Aplicação

Veja como o GestãoTour transforma dados em decisões.

### 📊 Dashboard Estratégico (Cockpit)
Uma visão macro do negócio em tempo real. O painel apresenta KPIs vitais como **Receita Total**, **Reservas Pendentes** e **Taxa de Ocupação**.
*   **Analytics:** Gráficos de tendência para identificar picos de venda (Sazonalidade).
*   **Alertas de Lotação:** Avisos visuais automáticos quando um tour atinge capacidade crítica (ex: "Lotação Alta - 90%").

<div align="center">
  <!-- Certifique-se de salvar a imagem como 'dashboard.png' na pasta 'assets' -->
  <img src="./assets/dashboard.png" alt="Dashboard de Reservas GestãoTour" width="100%" style="border-radius: 8px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
</div>

<br>

### 🗓️ Calendário de Aventuras
Organização visual completa. A visualização mensal permite arrastar e gerenciar eventos com facilidade.
*   **Status Color-Coded:** Identificação rápida de tipos de passeios (Gastronômico, Aventura, Relaxamento).
*   **Painel Lateral:** Resumo rápido dos próximos eventos e previsões de receita do mês.

<div align="center">
  <!-- Certifique-se de salvar a imagem como 'calendar.png' na pasta 'assets' -->
  <img src="./assets/calendar.png" alt="Calendário de Eventos GestãoTour" width="100%" style="border-radius: 8px; border: 1px solid #333; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
</div>

---

## ✨ Funcionalidades Principais

*   **🌑 Dark Mode Nativo:** Interface moderna que reduz a fadiga visual e destaca as informações críticas com acentos em verde neon.
*   **💰 Controle Financeiro:** Monitoramento preciso de entradas (€), com distinção clara entre reservas pagas e pendentes.
*   **🧠 Integração AI (Gemini):** Otimização de roteiros e sugestões baseadas no histórico de reservas.
*   **👥 Gestão de Participantes:** Controle granular de vagas (ex: 18/20 vagas preenchidas).

---

## 🛠️ Tech Stack

Construído sobre uma arquitetura moderna e escalável:

*   **Frontend:** React / Next.js
*   **Estilização:** Tailwind CSS (Design System)
*   **Backend & Auth:** Supabase (PostgreSQL)
*   **AI Engine:** Google Gemini API

---

## ⚡ Quick Start

Traga a operação para sua máquina local em minutos.

### 1. Clonar Repositório
```bash
git clone https://github.com/lucianomilani/gestaotour.git
cd gestaotour
2. Instalar Dependências
code
Bash
npm install
3. Configurar Variáveis (.env.local)
Crie o arquivo na raiz do projeto:
code
Env
GEMINI_API_KEY=sua_chave_aqui
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
4. Executar
code
Bash
npm run dev
Acesse: http://localhost:3000
🤝 Contribuição
Contribuições são bem-vindas! Se você tem ideias para novos módulos ou melhorias no dashboard:
Faça um Fork.
Crie uma Branch (git checkout -b feature/NovaFeature).
Commit (git commit -m 'feat: Adiciona gráfico de churn').
Push (git push origin feature/NovaFeature).
Abra um Pull Request.
<div align="center">
<sub>Desenvolvido por <a href="https://github.com/lucianomilani">Luciano Milani</a></sub>
</div>