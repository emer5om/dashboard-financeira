# Dashboard Financeiro 💰

Dashboard financeiro completo com gestão de receitas, despesas e investimentos em ads. Desenvolvido com Next.js 14, TypeScript, Tailwind CSS e Supabase.

## 🚀 Funcionalidades

- ✅ **Gestão de Transações**: Adicione, edite e exclua transações individuais
- 📊 **Métricas Avançadas**: ROI, ROAS, margem de lucro, lucro médio por dia
- 📈 **Gráficos Interativos**: Visualize evolução de resultados, receita vs custos
- 🔍 **Filtros Inteligentes**: Filtros rápidos (hoje, esta semana, últimos 7 dias, mês atual, etc)
- 💾 **Export CSV**: Exporte relatórios para análise externa
- 🎨 **UI/UX Premium**: Interface moderna, responsiva e elegante
- 📱 **Mobile First**: Otimizado para todos os dispositivos
- 🔔 **Notificações**: Toast notifications e modais de confirmação

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date**: date-fns

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase (gratuito)

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/emer5om/dashboard-financeira.git
cd dashboard-financeira
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **SQL Editor** e execute o script `supabase-setup.sql`
3. Copie as credenciais do projeto (Settings → API)

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse em: [http://localhost:3000](http://localhost:3000)

## 🗄️ Estrutura do Banco de Dados

### Tabela: `transactions`

| Campo      | Tipo      | Descrição                           |
|------------|-----------|-------------------------------------|
| id         | UUID      | Identificador único (PK)           |
| date       | DATE      | Data da transação                   |
| type       | TEXT      | Tipo: 'ads', 'expense', 'revenue'  |
| amount     | NUMERIC   | Valor da transação                  |
| category   | TEXT      | Categoria (opcional)                |
| note       | TEXT      | Observações (opcional)              |
| created_at | TIMESTAMP | Data de criação                     |

## 📦 Deploy na Vercel

1. Faça push para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente no Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy! 🎉

## 📊 Tipos de Transação

- **Investimento Ads**: Gastos com publicidade (Google Ads, Facebook Ads, etc)
- **Despesas**: Custos operacionais (ferramentas, hospedagem, etc)
- **Receitas**: Faturamento e vendas

## 📈 Métricas Calculadas

- **ROI (Return on Investment)**: `(Lucro / Custo Total) × 100%`
- **ROAS (Return on Ad Spend)**: `Receita / Investimento em Ads`
- **Margem de Lucro**: `(Lucro / Receita) × 100%`
- **Dias Positivos/Negativos**: Contagem de dias lucrativos vs prejuízo
- **Lucro Médio por Dia**: Média de lucro no período selecionado

## 🎨 Componentes Principais

- **Modal**: Formulários de adicionar/editar transações
- **Toast**: Notificações de feedback
- **ConfirmModal**: Confirmação de ações destrutivas
- **Cards de Métricas**: Visualização rápida de KPIs
- **Gráficos**: Linha, barra e pizza (Recharts)
- **Tabela**: Lista de transações com ações

## 🔐 Segurança

- Row Level Security (RLS) configurado no Supabase
- Validação de dados com Zod
- Variáveis de ambiente para credenciais
- HTTPS obrigatório em produção

## 📝 Licença

MIT License - sinta-se livre para usar em seus projetos!

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou pull request.

## 📞 Suporte

Para dúvidas ou problemas, abra uma [issue](https://github.com/emer5om/dashboard-financeira/issues).

---

Desenvolvido com ❤️ usando Next.js e Supabase
