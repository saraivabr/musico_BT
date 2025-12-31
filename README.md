# Jesus Cristo Bot

Chatbot espiritual para WhatsApp com IA avancada (Google Gemini).

## Funcionalidades

- **Companheiro Espiritual** - Conversas com sabedoria biblica e empatia
- **Devocional Diario** - Enviado automaticamente as 6h
- **Quiz Biblico** - Teste seus conhecimentos
- **Pedidos de Oracao** - Ore junto com Jesus
- **Planos de Leitura** - 21 dias, Primeiros Passos
- **Evangelismo** - Jornada guiada para conhecer Jesus
- **Busca Biblica** - Encontre versiculos por tema
- **Indicacao de Amigos** - Ajude quem precisa

## Requisitos

- Node.js 20+
- MongoDB
- Chave API do Google Gemini

## Instalacao

```bash
# Clonar
git clone <repo>
cd jesus-cristo-bot

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
| devocional | Versiculo do dia |
| quiz | Jogar quiz |
| orar | Pedido de oracao |
| planos | Planos de leitura |
| buscar | Buscar na Biblia |
| indicar | Indicar amigo |

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
