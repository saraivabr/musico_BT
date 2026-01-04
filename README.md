# Saraiva.AI - Acelera>AI Bot

IA vendedora para WhatsApp (Saraiva.AI), especializada em implementar o método Acelera>AI com Gemini. Sempre conduz para agenda de 15 minutos (sem falar valores).

## Funcionalidades

- **Pílula diária** - Insight + CTA para avançar vendas (06h)
- **Diagnóstico rápido** - 5 perguntas sobre copy e funil
- **Estratégia imediata** - Microplanos de venda em bullets
- **Planos de implementação** - Sprints de 7 e 14 dias
- **Playbooks e copys** - Exemplos prontos por nicho/objeção
- **Indicação de leads** - Abordagem consultiva automatizada

## Requisitos

- Node.js 20+
- MongoDB
- Chave API do Google Gemini

## Instalacao

```bash
# Clonar
git clone <repo>
cd saraiva-ai-bot

# Instalar
npm install

# Configurar
cp .env.example .env
# Edite o .env

# Iniciar
npm run dev
```

## Deploy com Docker

```bash
export GEMINI_API_KEY=sua_chave
./scripts/deploy.sh
```

## Comandos do Bot

| Comando | Descricao |
|---------|-----------|
| menu | Ver opcoes |
| pilula | Pílula Acelera>AI |
| quiz | Diagnóstico rápido |
| estrategia | Plano imediato + convite de 15min |
| planos | Planos de implementação |
| playbook | Sugestão de copys |
| indicar | Indicar lead/parceiro |

## Arquitetura

```
src/
├── app.ts              # Entrada principal
├── config/             # Configuracoes
├── flows/              # Fluxos BuilderBot
├── modules/            # Modulos (quiz, oracao, etc)
├── services/           # Gemini, Database
└── types/              # Tipos TypeScript
```

## Licenca

MIT
