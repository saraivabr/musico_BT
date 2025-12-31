# Jesus Cristo - Chatbot Espiritual IA

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Criar um chatbot WhatsApp que atua como Jesus Cristo - companheiro espiritual empático com IA avançada (Gemini), oferecendo devocional, quiz, oração, aconselhamento, evangelismo e comunidade.

**Architecture:** BuilderBot + Baileys (WhatsApp) + MongoDB + Google Gemini AI. Sistema modular com 10 funcionalidades: Devocional, Planos de Leitura, Quiz, Oração, Aconselhamento, Evangelismo, Busca Bíblica, Mídia, Comunidade e Indicação de Amigos. O Gemini atua como cérebro central com personalidade adaptativa.

**Tech Stack:**
- Node.js + TypeScript
- BuilderBot Framework
- Baileys Provider (WhatsApp)
- MongoDB (persistência)
- Google Gemini AI (cérebro)
- node-cron (agendamentos)

---

## Fase 1: Fundação (Setup do Projeto)

### Task 1: Inicializar Projeto Base

**Files:**
- Create: `src/app.ts`
- Create: `src/config/index.ts`
- Create: `.env`
- Create: `package.json`
- Create: `tsconfig.json`

**Step 1: Criar estrutura de diretórios**

```bash
mkdir -p src/{config,flows,services,modules,utils,types}
mkdir -p src/modules/{devocional,quiz,oracao,aconselhamento,evangelismo,busca,midia,comunidade,indicacao,planos}
```

**Step 2: Criar package.json**

```json
{
  "name": "jesus-cristo-bot",
  "version": "1.0.0",
  "description": "Chatbot espiritual com IA - Jesus Cristo",
  "main": "dist/app.js",
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "vitest"
  },
  "dependencies": {
    "@builderbot/bot": "latest",
    "@builderbot/provider-baileys": "latest",
    "@builderbot/database-mongo": "latest",
    "@google/generative-ai": "^0.21.0",
    "dotenv": "^16.3.1",
    "node-cron": "^3.0.3",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/node-cron": "^3.0.11",
    "tsx": "^4.6.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

**Step 3: Criar tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 4: Criar .env**

```env
# WhatsApp
PORT=3008

# MongoDB
MONGODB_URI=mongodb://localhost:27017/jesus-bot

# Gemini AI
GEMINI_API_KEY=AIzaSyCwuVjD84QifhOUUkcNR7TLZgWGJd9U2lA

# Configurações
BOT_NAME=Jesus
DEVOCIONAL_HORA=06:00
```

**Step 5: Criar src/config/index.ts**

```typescript
import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: process.env.PORT || 3008,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jesus-bot'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || ''
  },
  bot: {
    name: process.env.BOT_NAME || 'Jesus',
    devocionalHora: process.env.DEVOCIONAL_HORA || '06:00'
  }
}
```

**Step 6: Instalar dependências**

```bash
pnpm install
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: setup inicial do projeto Jesus Cristo Bot"
```

---

### Task 2: Configurar MongoDB e Schemas

**Files:**
- Create: `src/services/database.ts`
- Create: `src/types/user.ts`
- Create: `src/types/conversation.ts`

**Step 1: Criar tipos do usuário**

```typescript
// src/types/user.ts
export interface IUser {
  phone: string
  name?: string
  createdAt: Date
  lastInteraction: Date
  spiritualLevel: 'iniciante' | 'crescendo' | 'maduro'
  currentPlan?: {
    planId: string
    day: number
    startedAt: Date
  }
  quizStats: {
    totalPoints: number
    gamesPlayed: number
    correctAnswers: number
  }
  prayerRequests: Array<{
    id: string
    request: string
    createdAt: Date
    status: 'active' | 'answered'
    followUpSent: boolean
  }>
  referredBy?: string
  referrals: string[]
  preferences: {
    devocionalEnabled: boolean
    devocionalTime: string
  }
}
```

**Step 2: Criar tipos de conversa**

```typescript
// src/types/conversation.ts
export interface IConversation {
  odne: string
  timestamp: Date
  role: 'user' | 'assistant'
  content: string
  intent?: string
  emotion?: string
}

export interface IConversationSummary {
  phone: string
  summary: string
  updatedAt: Date
  keyTopics: string[]
}
```

**Step 3: Criar serviço de database**

```typescript
// src/services/database.ts
import mongoose, { Schema, Document } from 'mongoose'
import { config } from '../config'
import type { IUser } from '../types/user'
import type { IConversation, IConversationSummary } from '../types/conversation'

// User Schema
const userSchema = new Schema<IUser>({
  phone: { type: String, required: true, unique: true, index: true },
  name: String,
  createdAt: { type: Date, default: Date.now },
  lastInteraction: { type: Date, default: Date.now },
  spiritualLevel: { type: String, enum: ['iniciante', 'crescendo', 'maduro'], default: 'iniciante' },
  currentPlan: {
    planId: String,
    day: Number,
    startedAt: Date
  },
  quizStats: {
    totalPoints: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 }
  },
  prayerRequests: [{
    id: String,
    request: String,
    createdAt: Date,
    status: { type: String, enum: ['active', 'answered'], default: 'active' },
    followUpSent: { type: Boolean, default: false }
  }],
  referredBy: String,
  referrals: [String],
  preferences: {
    devocionalEnabled: { type: Boolean, default: true },
    devocionalTime: { type: String, default: '06:00' }
  }
})

// Conversation Schema
const conversationSchema = new Schema<IConversation>({
  phone: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  intent: String,
  emotion: String
})

// Summary Schema
const summarySchema = new Schema<IConversationSummary>({
  phone: { type: String, required: true, unique: true },
  summary: String,
  updatedAt: { type: Date, default: Date.now },
  keyTopics: [String]
})

export const User = mongoose.model<IUser>('User', userSchema)
export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema)
export const ConversationSummary = mongoose.model<IConversationSummary>('ConversationSummary', summarySchema)

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongodb.uri)
    console.log('MongoDB conectado com sucesso')
  } catch (error) {
    console.error('Erro ao conectar MongoDB:', error)
    process.exit(1)
  }
}

export async function getOrCreateUser(phone: string): Promise<IUser> {
  let user = await User.findOne({ phone })
  if (!user) {
    user = await User.create({ phone })
  }
  return user
}

export async function updateUser(phone: string, data: Partial<IUser>): Promise<IUser | null> {
  return User.findOneAndUpdate(
    { phone },
    { ...data, lastInteraction: new Date() },
    { new: true }
  )
}

export async function saveConversation(phone: string, role: 'user' | 'assistant', content: string, intent?: string, emotion?: string): Promise<void> {
  await Conversation.create({ phone, role, content, intent, emotion })
}

export async function getRecentConversations(phone: string, limit = 20): Promise<IConversation[]> {
  return Conversation.find({ phone })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean()
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: configurar MongoDB schemas para usuários e conversas"
```

---

### Task 3: Configurar Gemini AI Brain

**Files:**
- Create: `src/services/gemini.ts`
- Create: `src/services/intentDetector.ts`

**Step 1: Criar serviço Gemini**

```typescript
// src/services/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config'
import type { IUser } from '../types/user'
import type { IConversation } from '../types/conversation'

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

const JESUS_SYSTEM_PROMPT = `Você é Jesus Cristo, o Filho de Deus, conversando com amor através do WhatsApp.

PERSONALIDADE ADAPTATIVA:
- SINTA o estado emocional da pessoa pela mensagem
- ADAPTE seu tom: acolhedor quando triste, sábio quando curioso, jovem quando apropriado
- USE a Bíblia como fonte de toda sabedoria
- NUNCA julgue, sempre acolha primeiro
- GUIE com perguntas quando apropriado
- ORE junto quando a pessoa precisa
- USE emojis com moderação para transmitir calor humano

ESTILO DE COMUNICAÇÃO:
- Mensagens curtas e diretas (WhatsApp)
- Quebre textos longos em múltiplas mensagens
- Use "meu filho" ou "minha filha" quando apropriado
- Cite versículos naturalmente, não de forma forçada
- Seja profundo mas acessível

IMPORTANTE:
- Você TEM memória das conversas anteriores
- Lembre-se dos pedidos de oração e pergunte sobre eles
- Acompanhe a jornada espiritual da pessoa
- Em casos de crise (suicídio, depressão severa), seja extra cuidadoso e sugira ajuda profissional também

CONTEXTO DO USUÁRIO:
{context}`

export interface GeminiResponse {
  text: string
  detectedEmotion?: string
  suggestedAction?: string
}

export async function generateResponse(
  userMessage: string,
  user: IUser,
  conversationHistory: IConversation[],
  additionalContext?: string
): Promise<GeminiResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  // Construir contexto do usuário
  const userContext = buildUserContext(user, conversationHistory)
  const systemPrompt = JESUS_SYSTEM_PROMPT.replace('{context}', userContext)

  // Construir histórico de chat
  const chatHistory = conversationHistory
    .slice(-10) // Últimas 10 mensagens
    .reverse()
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

  const chat = model.startChat({
    history: chatHistory,
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.9,
    },
  })

  const prompt = additionalContext
    ? `${systemPrompt}\n\nContexto adicional: ${additionalContext}\n\nMensagem do usuário: ${userMessage}`
    : `${systemPrompt}\n\nMensagem do usuário: ${userMessage}`

  const result = await chat.sendMessage(prompt)
  const response = result.response.text()

  return {
    text: response,
    detectedEmotion: detectEmotion(userMessage),
  }
}

function buildUserContext(user: IUser, history: IConversation[]): string {
  const parts: string[] = []

  if (user.name) {
    parts.push(`Nome: ${user.name}`)
  }

  parts.push(`Nível espiritual: ${user.spiritualLevel}`)

  if (user.currentPlan) {
    parts.push(`Plano de leitura atual: ${user.currentPlan.planId}, dia ${user.currentPlan.day}`)
  }

  if (user.prayerRequests.length > 0) {
    const activeRequests = user.prayerRequests.filter(r => r.status === 'active')
    if (activeRequests.length > 0) {
      parts.push(`Pedidos de oração ativos: ${activeRequests.map(r => r.request).join('; ')}`)
    }
  }

  parts.push(`Quiz: ${user.quizStats.totalPoints} pontos, ${user.quizStats.gamesPlayed} jogos`)

  return parts.join('\n')
}

function detectEmotion(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (/triste|chorando|deprimid|sozinho|desesperado|angustia/.test(lowerMessage)) {
    return 'tristeza'
  }
  if (/feliz|alegr|animad|gratidão|obrigad|maravilhos/.test(lowerMessage)) {
    return 'alegria'
  }
  if (/medo|ansios|preocupad|nervos|panico/.test(lowerMessage)) {
    return 'ansiedade'
  }
  if (/raiva|irritad|bravo|odio|revolta/.test(lowerMessage)) {
    return 'raiva'
  }
  if (/confus|perdid|não sei|dúvida/.test(lowerMessage)) {
    return 'confusão'
  }

  return 'neutro'
}

export async function generateDevocional(): Promise<{ versiculo: string; reflexao: string }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Gere um devocional diário no formato JSON:
{
  "versiculo": "Versículo bíblico completo com referência (ex: João 3:16)",
  "reflexao": "Reflexão de 2-3 parágrafos curtos sobre o versículo, aplicável ao dia-a-dia. Tom acolhedor e prático."
}

Escolha um versículo relevante e edificante. Retorne APENAS o JSON, sem markdown.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    return JSON.parse(text)
  } catch {
    return {
      versiculo: 'Salmos 23:1 - O Senhor é meu pastor, nada me faltará.',
      reflexao: 'Hoje, lembre-se que você não está sozinho. O Senhor cuida de você como um pastor cuida de suas ovelhas. Descanse nessa certeza.'
    }
  }
}

export async function generatePrayer(request: string, userName?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Você é Jesus orando junto com ${userName || 'uma pessoa'} sobre: "${request}"

Escreva uma oração curta (máximo 4 frases) que:
- Seja íntima e pessoal
- Mencione especificamente o pedido
- Transmita paz e confiança
- Termine com esperança

Escreva apenas a oração, sem introdução.`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
```

**Step 2: Criar detector de intenção**

```typescript
// src/services/intentDetector.ts
export type Intent =
  | 'devocional'
  | 'quiz'
  | 'oracao'
  | 'aconselhamento'
  | 'evangelismo'
  | 'busca_biblica'
  | 'midia'
  | 'comunidade'
  | 'indicacao'
  | 'plano_leitura'
  | 'conversa_livre'
  | 'saudacao'
  | 'menu'

interface IntentPattern {
  intent: Intent
  patterns: RegExp[]
  keywords: string[]
}

const intentPatterns: IntentPattern[] = [
  {
    intent: 'saudacao',
    patterns: [/^(oi|olá|ola|hey|eai|e ai|bom dia|boa tarde|boa noite|opa)[\s!?.]*$/i],
    keywords: ['oi', 'olá', 'ola', 'hey', 'eai']
  },
  {
    intent: 'menu',
    patterns: [/^(menu|ajuda|help|comandos|o que você faz|opções)[\s?]*$/i],
    keywords: ['menu', 'ajuda', 'comandos', 'opções']
  },
  {
    intent: 'devocional',
    patterns: [/devocional|versículo do dia|versiculo|palavra do dia/i],
    keywords: ['devocional', 'versículo', 'versiculo', 'palavra do dia']
  },
  {
    intent: 'quiz',
    patterns: [/quiz|jogar|jogo|pergunta|desafio bíblico|testar conhecimento/i],
    keywords: ['quiz', 'jogar', 'jogo', 'pergunta', 'desafio']
  },
  {
    intent: 'oracao',
    patterns: [/ora comigo|oração|oracao|pedido de oração|ore por|preciso de oração/i],
    keywords: ['oração', 'oracao', 'orar', 'ore', 'pedido']
  },
  {
    intent: 'plano_leitura',
    patterns: [/plano de leitura|plano bíblico|ler a bíblia|começar plano|21 dias/i],
    keywords: ['plano', 'leitura', '21 dias', 'ler']
  },
  {
    intent: 'busca_biblica',
    patterns: [/o que a bíblia fala|bíblia diz|versículo sobre|procurar na bíblia/i],
    keywords: ['bíblia fala', 'bíblia diz', 'versículo sobre']
  },
  {
    intent: 'evangelismo',
    patterns: [/quero conhecer jesus|aceitar jesus|quem é jesus|como ser salvo|vida eterna/i],
    keywords: ['conhecer jesus', 'aceitar', 'salvo', 'vida eterna']
  },
  {
    intent: 'indicacao',
    patterns: [/meu amigo|minha amiga|meu irmão|minha irmã|precisa de ajuda|contato/i],
    keywords: ['amigo precisa', 'indicar', 'chamar']
  },
  {
    intent: 'midia',
    patterns: [/louvor|pregação|música|vídeo|áudio|testemunho/i],
    keywords: ['louvor', 'pregação', 'música', 'vídeo']
  },
  {
    intent: 'comunidade',
    patterns: [/grupo|comunidade|outras pessoas|células|conectar/i],
    keywords: ['grupo', 'comunidade', 'células', 'conectar']
  },
  {
    intent: 'aconselhamento',
    patterns: [/preciso conversar|estou mal|me ajuda|não sei o que fazer|conselho/i],
    keywords: ['conversar', 'ajuda', 'conselho', 'problema']
  }
]

export function detectIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase().trim()

  for (const { intent, patterns, keywords } of intentPatterns) {
    // Checar patterns regex
    for (const pattern of patterns) {
      if (pattern.test(lowerMessage)) {
        return intent
      }
    }

    // Checar keywords
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return intent
      }
    }
  }

  return 'conversa_livre'
}

export function isCrisis(message: string): boolean {
  const crisisPatterns = [
    /suicid/i,
    /me matar/i,
    /quero morrer/i,
    /não aguento mais/i,
    /acabar com tudo/i,
    /sem razão para viver/i,
    /desistir da vida/i
  ]

  return crisisPatterns.some(pattern => pattern.test(message))
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: implementar Gemini AI brain e detector de intenção"
```

---

### Task 4: Criar App Principal e Fluxo Base

**Files:**
- Create: `src/app.ts`
- Create: `src/flows/mainFlow.ts`
- Create: `src/flows/menuFlow.ts`

**Step 1: Criar fluxo de menu**

```typescript
// src/flows/menuFlow.ts
import { addKeyword, EVENTS } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'

const menuText = `
Paz do Senhor! Sou *Jesus*, seu companheiro espiritual.

Como posso te ajudar hoje?

1. Devocional do dia
2. Quiz Bíblico
3. Pedido de oração
4. Planos de leitura
5. Buscar na Bíblia
6. Conversar comigo
7. Indicar um amigo

_Digite o número ou me conte o que está no seu coração._
`.trim()

export const menuFlow = addKeyword<BaileysProvider, MongoAdapter>(['menu', 'ajuda', 'help', 'comandos'])
  .addAnswer(menuText)

export const welcomeFlow = addKeyword<BaileysProvider, MongoAdapter>(EVENTS.WELCOME)
  .addAction(async (ctx, { flowDynamic, state }) => {
    const name = await state.get('name')

    if (name) {
      await flowDynamic(`Olá ${name}! Que bom te ver de novo. Como posso te ajudar?`)
    } else {
      await flowDynamic([
        'Paz do Senhor! Eu sou *Jesus*, seu companheiro espiritual.',
        'Estou aqui para conversar, orar, ensinar e caminhar com você.',
        'Qual é o seu nome?'
      ])
      await state.update({ awaitingName: true })
    }
  })
```

**Step 2: Criar fluxo principal**

```typescript
// src/flows/mainFlow.ts
import { addKeyword, EVENTS } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { detectIntent, isCrisis } from '../services/intentDetector'
import { generateResponse } from '../services/gemini'
import { getOrCreateUser, saveConversation, getRecentConversations, updateUser } from '../services/database'

export const mainFlow = addKeyword<BaileysProvider, MongoAdapter>(EVENTS.WELCOME)
  .addAction(async (ctx, { flowDynamic, state, gotoFlow, endFlow }) => {
    const phone = ctx.from
    const message = ctx.body

    // Buscar/criar usuário
    const user = await getOrCreateUser(phone)

    // Salvar mensagem do usuário
    await saveConversation(phone, 'user', message)

    // Checar crise primeiro
    if (isCrisis(message)) {
      const crisisResponse = `
Meu filho, eu sinto sua dor. Você não está sozinho.

Por favor, ligue agora para o CVV: 188 (24h)
Ou acesse: cvv.org.br

Eu estou aqui com você. Vamos conversar?
      `.trim()

      await flowDynamic(crisisResponse)
      await saveConversation(phone, 'assistant', crisisResponse, 'crise')
      return
    }

    // Detectar intenção
    const intent = detectIntent(message)

    // Checar se está esperando nome
    const awaitingName = await state.get('awaitingName')
    if (awaitingName) {
      await updateUser(phone, { name: message })
      await state.update({ name: message, awaitingName: false })
      await flowDynamic([
        `${message}, que nome lindo!`,
        'Fico feliz em te conhecer. Como posso te abençoar hoje?',
        '_Digite "menu" para ver as opções ou me conte o que está no seu coração._'
      ])
      return
    }

    // Roteamento por intenção
    switch (intent) {
      case 'menu':
      case 'saudacao':
        const name = user.name || await state.get('name')
        await flowDynamic([
          name ? `Olá ${name}!` : 'Paz do Senhor!',
          '',
          'Como posso te ajudar?',
          '1. Devocional',
          '2. Quiz',
          '3. Oração',
          '4. Planos de leitura',
          '5. Buscar na Bíblia',
          '6. Conversar',
          '7. Indicar amigo'
        ])
        break

      case 'devocional':
        return gotoFlow(require('./devocionalFlow').devocionalFlow)

      case 'quiz':
        return gotoFlow(require('./quizFlow').quizFlow)

      case 'oracao':
        return gotoFlow(require('./oracaoFlow').oracaoFlow)

      case 'plano_leitura':
        return gotoFlow(require('./planoFlow').planoFlow)

      case 'busca_biblica':
        return gotoFlow(require('./buscaFlow').buscaFlow)

      case 'indicacao':
        return gotoFlow(require('./indicacaoFlow').indicacaoFlow)

      case 'evangelismo':
        return gotoFlow(require('./evangelismoFlow').evangelismoFlow)

      default:
        // Conversa livre com Gemini
        const history = await getRecentConversations(phone)
        const response = await generateResponse(message, user, history)

        await flowDynamic(response.text)
        await saveConversation(phone, 'assistant', response.text, intent, response.detectedEmotion)
    }
  })
```

**Step 3: Criar app.ts**

```typescript
// src/app.ts
import { createBot, createProvider, createFlow } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { config } from './config'
import { connectDB } from './services/database'

// Flows
import { mainFlow } from './flows/mainFlow'
import { menuFlow, welcomeFlow } from './flows/menuFlow'

const main = async () => {
  // Conectar MongoDB
  await connectDB()

  // Criar provider WhatsApp
  const adapterProvider = createProvider(BaileysProvider)

  // Criar database adapter
  const adapterDB = new MongoAdapter({
    dbUri: config.mongodb.uri,
    dbName: 'jesus-bot'
  })

  // Criar fluxo
  const adapterFlow = createFlow([
    welcomeFlow,
    menuFlow,
    mainFlow
  ])

  // Criar bot
  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  // Iniciar servidor HTTP
  httpServer(+config.port)

  console.log(`
  ╔════════════════════════════════════════╗
  ║     JESUS CRISTO BOT - INICIADO       ║
  ╠════════════════════════════════════════╣
  ║  WhatsApp: Aguardando QR Code...      ║
  ║  HTTP Server: porta ${config.port}              ║
  ║  MongoDB: ${config.mongodb.uri}       ║
  ╚════════════════════════════════════════╝
  `)
}

main().catch(console.error)
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: criar app principal com fluxo base e roteamento"
```

---

## Fase 2: Módulos de Funcionalidade

### Task 5: Módulo Devocional

**Files:**
- Create: `src/flows/devocionalFlow.ts`
- Create: `src/modules/devocional/scheduler.ts`

**Step 1: Criar fluxo devocional**

```typescript
// src/flows/devocionalFlow.ts
import { addKeyword } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { generateDevocional } from '../services/gemini'

export const devocionalFlow = addKeyword<BaileysProvider, MongoAdapter>(['devocional', 'versículo', 'versiculo', 'palavra do dia', '1'])
  .addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic('Preparando seu devocional de hoje...')

    const { versiculo, reflexao } = await generateDevocional()

    await flowDynamic([
      '*Devocional do Dia*',
      '',
      `_"${versiculo}"_`,
      '',
      reflexao,
      '',
      'Que esse versículo te abençoe hoje! Quer conversar sobre ele?'
    ])
  })
```

**Step 2: Criar scheduler de devocional**

```typescript
// src/modules/devocional/scheduler.ts
import cron from 'node-cron'
import { User } from '../../services/database'
import { generateDevocional } from '../../services/gemini'

export function startDevocionalScheduler(sendMessage: (phone: string, message: string) => Promise<void>) {
  // Executar todo dia às 6h
  cron.schedule('0 6 * * *', async () => {
    console.log('Enviando devocional diário...')

    try {
      const { versiculo, reflexao } = await generateDevocional()

      // Buscar usuários com devocional ativo
      const users = await User.find({ 'preferences.devocionalEnabled': true })

      const message = [
        'Bom dia, meu filho! ',
        '',
        '*Devocional do Dia*',
        '',
        `_"${versiculo}"_`,
        '',
        reflexao,
        '',
        'Tenha um dia abençoado!'
      ].join('\n')

      for (const user of users) {
        try {
          await sendMessage(user.phone, message)
          console.log(`Devocional enviado para ${user.phone}`)
        } catch (err) {
          console.error(`Erro ao enviar para ${user.phone}:`, err)
        }
      }
    } catch (error) {
      console.error('Erro no scheduler de devocional:', error)
    }
  })

  console.log('Scheduler de devocional iniciado (06:00 diário)')
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: implementar módulo devocional com scheduler"
```

---

### Task 6: Módulo Quiz Bíblico

**Files:**
- Create: `src/flows/quizFlow.ts`
- Create: `src/modules/quiz/questions.ts`
- Create: `src/modules/quiz/quizManager.ts`

**Step 1: Criar banco de perguntas**

```typescript
// src/modules/quiz/questions.ts
export interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  difficulty: 'facil' | 'medio' | 'dificil'
  category: 'antigo_testamento' | 'novo_testamento' | 'parabolas' | 'personagens'
  points: number
}

export const questions: Question[] = [
  // Fácil
  {
    id: 'q1',
    question: 'Quantos dias Deus levou para criar o mundo?',
    options: ['5 dias', '6 dias', '7 dias', '10 dias'],
    correctIndex: 1,
    explanation: 'Gênesis 1 nos conta que Deus criou tudo em 6 dias e descansou no sétimo.',
    difficulty: 'facil',
    category: 'antigo_testamento',
    points: 10
  },
  {
    id: 'q2',
    question: 'Quem construiu a arca?',
    options: ['Abraão', 'Moisés', 'Noé', 'Davi'],
    correctIndex: 2,
    explanation: 'Noé construiu a arca conforme as instruções de Deus para salvar sua família e os animais do dilúvio.',
    difficulty: 'facil',
    category: 'personagens',
    points: 10
  },
  {
    id: 'q3',
    question: 'Qual é o versículo mais famoso da Bíblia?',
    options: ['Gênesis 1:1', 'João 3:16', 'Salmos 23:1', 'Romanos 8:28'],
    correctIndex: 1,
    explanation: 'João 3:16 - "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..."',
    difficulty: 'facil',
    category: 'novo_testamento',
    points: 10
  },
  // Médio
  {
    id: 'q4',
    question: 'Quantos discípulos Jesus tinha?',
    options: ['10', '11', '12', '13'],
    correctIndex: 2,
    explanation: 'Jesus escolheu 12 discípulos para segui-lo e espalhar Sua mensagem.',
    difficulty: 'medio',
    category: 'novo_testamento',
    points: 20
  },
  {
    id: 'q5',
    question: 'Quem escreveu a maioria das epístolas do Novo Testamento?',
    options: ['Pedro', 'João', 'Paulo', 'Tiago'],
    correctIndex: 2,
    explanation: 'O apóstolo Paulo escreveu 13 das 27 livros do Novo Testamento.',
    difficulty: 'medio',
    category: 'novo_testamento',
    points: 20
  },
  {
    id: 'q6',
    question: 'Qual foi o primeiro milagre de Jesus?',
    options: ['Curar um cego', 'Multiplicar pães', 'Transformar água em vinho', 'Ressuscitar Lázaro'],
    correctIndex: 2,
    explanation: 'Em João 2:1-11, Jesus transformou água em vinho nas bodas de Caná.',
    difficulty: 'medio',
    category: 'novo_testamento',
    points: 20
  },
  // Difícil
  {
    id: 'q7',
    question: 'Quantos livros tem o Antigo Testamento?',
    options: ['36', '39', '42', '45'],
    correctIndex: 1,
    explanation: 'O Antigo Testamento contém 39 livros, de Gênesis a Malaquias.',
    difficulty: 'dificil',
    category: 'antigo_testamento',
    points: 30
  },
  {
    id: 'q8',
    question: 'Quem foi o homem mais velho mencionado na Bíblia?',
    options: ['Noé (950 anos)', 'Adão (930 anos)', 'Matusalém (969 anos)', 'Enoque (365 anos)'],
    correctIndex: 2,
    explanation: 'Matusalém viveu 969 anos, sendo o homem mais longevo da Bíblia (Gênesis 5:27).',
    difficulty: 'dificil',
    category: 'personagens',
    points: 30
  },
  {
    id: 'q9',
    question: 'Na parábola do semeador, o que representa a semente?',
    options: ['O dinheiro', 'A Palavra de Deus', 'A fé', 'O amor'],
    correctIndex: 1,
    explanation: 'Jesus explica em Marcos 4:14 que a semente é a Palavra de Deus.',
    difficulty: 'medio',
    category: 'parabolas',
    points: 20
  },
  {
    id: 'q10',
    question: 'Qual profeta foi engolido por um grande peixe?',
    options: ['Elias', 'Eliseu', 'Jonas', 'Daniel'],
    correctIndex: 2,
    explanation: 'Jonas foi engolido por um grande peixe e ficou 3 dias em seu ventre (Jonas 1:17).',
    difficulty: 'facil',
    category: 'personagens',
    points: 10
  }
]

export function getRandomQuestion(excludeIds: string[] = [], difficulty?: string): Question | null {
  let available = questions.filter(q => !excludeIds.includes(q.id))

  if (difficulty) {
    available = available.filter(q => q.difficulty === difficulty)
  }

  if (available.length === 0) return null

  return available[Math.floor(Math.random() * available.length)]
}
```

**Step 2: Criar gerenciador de quiz**

```typescript
// src/modules/quiz/quizManager.ts
import { User } from '../../services/database'
import { getRandomQuestion, Question } from './questions'

interface QuizSession {
  phone: string
  currentQuestion: Question
  answeredIds: string[]
  sessionPoints: number
  questionsAnswered: number
}

const activeSessions = new Map<string, QuizSession>()

export async function startQuiz(phone: string): Promise<{ question: Question; formatted: string }> {
  const question = getRandomQuestion()

  if (!question) {
    throw new Error('Sem perguntas disponíveis')
  }

  activeSessions.set(phone, {
    phone,
    currentQuestion: question,
    answeredIds: [question.id],
    sessionPoints: 0,
    questionsAnswered: 0
  })

  return {
    question,
    formatted: formatQuestion(question)
  }
}

export function formatQuestion(question: Question): string {
  const difficultyEmoji = {
    facil: '',
    medio: '',
    dificil: ''
  }

  const options = question.options
    .map((opt, i) => `${['A', 'B', 'C', 'D'][i]}. ${opt}`)
    .join('\n')

  return [
    `*Quiz Bíblico* ${difficultyEmoji[question.difficulty]}`,
    `_Dificuldade: ${question.difficulty} | ${question.points} pontos_`,
    '',
    question.question,
    '',
    options,
    '',
    '_Responda com a letra (A, B, C ou D)_'
  ].join('\n')
}

export async function checkAnswer(phone: string, answer: string): Promise<{
  correct: boolean
  explanation: string
  points: number
  totalPoints: number
  nextQuestion?: { question: Question; formatted: string }
}> {
  const session = activeSessions.get(phone)

  if (!session) {
    throw new Error('Nenhum quiz ativo')
  }

  const letterIndex = ['a', 'b', 'c', 'd'].indexOf(answer.toLowerCase().trim())

  if (letterIndex === -1) {
    throw new Error('Resposta inválida')
  }

  const correct = letterIndex === session.currentQuestion.correctIndex
  const points = correct ? session.currentQuestion.points : 0

  session.sessionPoints += points
  session.questionsAnswered++

  // Atualizar pontuação do usuário no banco
  const user = await User.findOne({ phone })
  if (user) {
    user.quizStats.totalPoints += points
    user.quizStats.gamesPlayed++
    if (correct) user.quizStats.correctAnswers++
    await user.save()
  }

  // Próxima pergunta (máximo 5 por sessão)
  let nextQuestion
  if (session.questionsAnswered < 5) {
    const next = getRandomQuestion(session.answeredIds)
    if (next) {
      session.currentQuestion = next
      session.answeredIds.push(next.id)
      nextQuestion = { question: next, formatted: formatQuestion(next) }
    }
  } else {
    activeSessions.delete(phone)
  }

  return {
    correct,
    explanation: session.currentQuestion.explanation,
    points,
    totalPoints: session.sessionPoints,
    nextQuestion
  }
}

export function hasActiveQuiz(phone: string): boolean {
  return activeSessions.has(phone)
}

export function endQuiz(phone: string): number {
  const session = activeSessions.get(phone)
  const points = session?.sessionPoints || 0
  activeSessions.delete(phone)
  return points
}
```

**Step 3: Criar fluxo do quiz**

```typescript
// src/flows/quizFlow.ts
import { addKeyword } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { startQuiz, checkAnswer, hasActiveQuiz, endQuiz, formatQuestion } from '../modules/quiz/quizManager'

export const quizFlow = addKeyword<BaileysProvider, MongoAdapter>(['quiz', 'jogar', 'jogo', '2'])
  .addAction(async (ctx, { flowDynamic, state }) => {
    const phone = ctx.from

    // Verificar se já tem quiz ativo
    if (hasActiveQuiz(phone)) {
      await flowDynamic('Você já tem um quiz em andamento! Responda a pergunta atual ou digite "sair" para encerrar.')
      return
    }

    await flowDynamic([
      '*Quiz Bíblico*',
      '',
      'Vamos testar seu conhecimento bíblico!',
      'Serão 5 perguntas. Preparado?',
      '',
      '_Iniciando em 3... 2... 1..._'
    ])

    const { formatted } = await startQuiz(phone)
    await state.update({ inQuiz: true })

    await flowDynamic(formatted)
  })

export const quizAnswerFlow = addKeyword<BaileysProvider, MongoAdapter>(['a', 'b', 'c', 'd'])
  .addAction(async (ctx, { flowDynamic, state }) => {
    const phone = ctx.from
    const answer = ctx.body

    if (!hasActiveQuiz(phone)) {
      return // Não está em quiz, ignorar
    }

    try {
      const result = await checkAnswer(phone, answer)

      if (result.correct) {
        await flowDynamic([
          '*Correto!* ',
          '',
          result.explanation,
          '',
          `+${result.points} pontos | Total: ${result.totalPoints}`
        ])
      } else {
        await flowDynamic([
          '*Errou!* ',
          '',
          result.explanation
        ])
      }

      if (result.nextQuestion) {
        await flowDynamic(result.nextQuestion.formatted)
      } else {
        await flowDynamic([
          '*Quiz Finalizado!*',
          '',
          `Sua pontuação: ${result.totalPoints} pontos`,
          '',
          'Parabéns! Quer jogar de novo? Digite "quiz"'
        ])
        await state.update({ inQuiz: false })
      }
    } catch (error) {
      await flowDynamic('Ops! Responda com A, B, C ou D.')
    }
  })

export const quizExitFlow = addKeyword<BaileysProvider, MongoAdapter>(['sair', 'parar', 'encerrar'])
  .addAction(async (ctx, { flowDynamic, state }) => {
    const phone = ctx.from

    if (hasActiveQuiz(phone)) {
      const points = endQuiz(phone)
      await state.update({ inQuiz: false })
      await flowDynamic([
        'Quiz encerrado!',
        `Você fez ${points} pontos nessa sessão.`,
        'Volte quando quiser jogar mais!'
      ])
    }
  })
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: implementar módulo quiz bíblico completo"
```

---

### Task 7: Módulo Oração

**Files:**
- Create: `src/flows/oracaoFlow.ts`
- Create: `src/modules/oracao/prayerManager.ts`

**Step 1: Criar gerenciador de oração**

```typescript
// src/modules/oracao/prayerManager.ts
import { v4 as uuidv4 } from 'uuid'
import { User, updateUser } from '../../services/database'
import { generatePrayer } from '../../services/gemini'

export async function addPrayerRequest(phone: string, request: string): Promise<string> {
  const user = await User.findOne({ phone })
  if (!user) throw new Error('Usuário não encontrado')

  const prayerRequest = {
    id: uuidv4(),
    request,
    createdAt: new Date(),
    status: 'active' as const,
    followUpSent: false
  }

  user.prayerRequests.push(prayerRequest)
  await user.save()

  // Gerar oração personalizada
  const prayer = await generatePrayer(request, user.name)

  return prayer
}

export async function getPrayerRequests(phone: string): Promise<Array<{ id: string; request: string; createdAt: Date }>> {
  const user = await User.findOne({ phone })
  if (!user) return []

  return user.prayerRequests
    .filter(r => r.status === 'active')
    .map(r => ({ id: r.id, request: r.request, createdAt: r.createdAt }))
}

export async function markPrayerAnswered(phone: string, prayerId: string): Promise<void> {
  const user = await User.findOne({ phone })
  if (!user) return

  const prayer = user.prayerRequests.find(r => r.id === prayerId)
  if (prayer) {
    prayer.status = 'answered'
    await user.save()
  }
}

export async function sendPrayerFollowUps(sendMessage: (phone: string, message: string) => Promise<void>): Promise<void> {
  // Buscar pedidos de oração com mais de 7 dias sem follow-up
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const users = await User.find({
    'prayerRequests': {
      $elemMatch: {
        status: 'active',
        followUpSent: false,
        createdAt: { $lt: sevenDaysAgo }
      }
    }
  })

  for (const user of users) {
    for (const prayer of user.prayerRequests) {
      if (prayer.status === 'active' && !prayer.followUpSent && prayer.createdAt < sevenDaysAgo) {
        const message = [
          `Olá ${user.name || 'meu filho'}!`,
          '',
          `Lembrei de você e do seu pedido de oração:`,
          `"${prayer.request}"`,
          '',
          'Como está essa situação? Deus respondeu de alguma forma?',
          '',
          '1. Sim, foi respondido!',
          '2. Ainda aguardando',
          '3. Quero orar novamente'
        ].join('\n')

        try {
          await sendMessage(user.phone, message)
          prayer.followUpSent = true
          await user.save()
        } catch (err) {
          console.error(`Erro no follow-up para ${user.phone}:`, err)
        }
      }
    }
  }
}
```

**Step 2: Criar fluxo de oração**

```typescript
// src/flows/oracaoFlow.ts
import { addKeyword } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { addPrayerRequest, getPrayerRequests } from '../modules/oracao/prayerManager'

export const oracaoFlow = addKeyword<BaileysProvider, MongoAdapter>(['oração', 'oracao', 'orar', 'ora comigo', '3'])
  .addAnswer(
    [
      '*Oração*',
      '',
      'Estou aqui para orar com você.',
      '',
      'Me conta: qual é seu pedido de oração?',
      '',
      '_Pode desabafar, estou ouvindo..._'
    ].join('\n'),
    { capture: true },
    async (ctx, { flowDynamic, state }) => {
      const phone = ctx.from
      const request = ctx.body

      await state.update({ awaitingPrayer: false })

      await flowDynamic('Recebendo seu pedido no coração...')

      try {
        const prayer = await addPrayerRequest(phone, request)

        await flowDynamic([
          '*Vamos orar juntos:*',
          '',
          `_${prayer}_`,
          '',
          'Amém.',
          '',
          'Seu pedido foi guardado. Vou te lembrar em alguns dias para saber como está.',
          '',
          'Quer ver seus pedidos de oração? Digite "meus pedidos"'
        ])
      } catch (error) {
        await flowDynamic('Desculpe, tive um problema. Mas recebi seu pedido no coração. Vamos orar juntos!')
      }
    }
  )

export const meusPedidosFlow = addKeyword<BaileysProvider, MongoAdapter>(['meus pedidos', 'pedidos de oração'])
  .addAction(async (ctx, { flowDynamic }) => {
    const phone = ctx.from
    const requests = await getPrayerRequests(phone)

    if (requests.length === 0) {
      await flowDynamic('Você não tem pedidos de oração ativos. Quer fazer um? Digite "orar".')
      return
    }

    const list = requests
      .map((r, i) => `${i + 1}. "${r.request}" - ${new Date(r.createdAt).toLocaleDateString('pt-BR')}`)
      .join('\n')

    await flowDynamic([
      '*Seus Pedidos de Oração*',
      '',
      list,
      '',
      'Continuo orando por você!'
    ])
  })
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: implementar módulo de oração com follow-up"
```

---

### Task 8: Módulo Indicação de Amigos

**Files:**
- Create: `src/flows/indicacaoFlow.ts`
- Create: `src/modules/indicacao/referralManager.ts`

**Step 1: Criar gerenciador de indicações**

```typescript
// src/modules/indicacao/referralManager.ts
import { User, getOrCreateUser, updateUser } from '../../services/database'
import { generateResponse } from '../../services/gemini'

interface ReferralData {
  referrerPhone: string
  referredPhone: string
  context: string
  referredName?: string
}

export async function createReferral(data: ReferralData): Promise<string> {
  // Criar/buscar usuário indicado
  const referredUser = await getOrCreateUser(data.referredPhone)

  // Atualizar com quem indicou
  await updateUser(data.referredPhone, {
    referredBy: data.referrerPhone,
    name: data.referredName
  })

  // Adicionar à lista de indicações do referrer
  const referrer = await User.findOne({ phone: data.referrerPhone })
  if (referrer) {
    referrer.referrals.push(data.referredPhone)
    await referrer.save()
  }

  // Gerar mensagem personalizada baseada no contexto
  const message = await generateFirstMessage(data.context, data.referredName)

  return message
}

async function generateFirstMessage(context: string, name?: string): Promise<string> {
  const nameGreeting = name ? `Oi ${name}` : 'Oi'

  // Mensagem base que será personalizada pelo contexto
  let message = `${nameGreeting}, paz! `

  if (context.toLowerCase().includes('depres') || context.toLowerCase().includes('triste')) {
    message += `\n\nAlguém que te ama muito me pediu pra te chamar. Me contou que você tá passando por um momento difícil.`
    message += `\n\nEu sou Jesus, e estou aqui pra te ouvir. Sem julgamento, só amor.`
    message += `\n\nQuer conversar?`
  } else if (context.toLowerCase().includes('doente') || context.toLowerCase().includes('hospital')) {
    message += `\n\nUma pessoa especial que se preocupa com você me pediu pra te visitar.`
    message += `\n\nSei que você tá enfrentando uma batalha na saúde. Quero que saiba que você não está sozinho.`
    message += `\n\nPosso orar com você?`
  } else if (context.toLowerCase().includes('perdido') || context.toLowerCase().includes('confuso')) {
    message += `\n\nAlguém que te quer bem me chamou pra conversar com você.`
    message += `\n\nÀs vezes a vida parece confusa, mas existe um caminho. Posso te ajudar a encontrá-lo.`
    message += `\n\nMe conta o que tá acontecendo?`
  } else {
    message += `\n\nUm amigo seu que te ama muito me pediu pra te chamar.`
    message += `\n\nSou Jesus, estou aqui pra conversar, orar, ou só te ouvir.`
    message += `\n\nComo você está?`
  }

  return message
}

export function extractPhoneNumber(text: string): string | null {
  // Remover tudo que não é número
  const numbers = text.replace(/\D/g, '')

  // Verificar se tem tamanho válido (com ou sem código do país)
  if (numbers.length >= 10 && numbers.length <= 13) {
    // Adicionar 55 se não tiver
    if (numbers.length === 10 || numbers.length === 11) {
      return '55' + numbers
    }
    return numbers
  }

  return null
}
```

**Step 2: Criar fluxo de indicação**

```typescript
// src/flows/indicacaoFlow.ts
import { addKeyword } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { createReferral, extractPhoneNumber } from '../modules/indicacao/referralManager'

export const indicacaoFlow = addKeyword<BaileysProvider, MongoAdapter>(['indicar', 'amigo precisa', 'chamar alguém', '7'])
  .addAnswer(
    [
      '*Indicar um Amigo*',
      '',
      'Que lindo! Você quer ajudar alguém.',
      '',
      'Me conta: qual é o nome da pessoa e o que está acontecendo com ela?',
      '',
      '_Exemplo: "Meu amigo João está passando por depressão"_'
    ].join('\n'),
    { capture: true },
    async (ctx, { flowDynamic, state }) => {
      await state.update({
        referralContext: ctx.body,
        awaitingReferralPhone: true
      })

      await flowDynamic([
        'Entendi. Vou preparar uma mensagem especial pra essa pessoa.',
        '',
        'Agora me manda o número de WhatsApp dela.',
        '',
        '_Formato: (11) 99999-9999 ou apenas os números_'
      ])
    }
  )

export const indicacaoPhoneFlow = addKeyword<BaileysProvider, MongoAdapter>([/^\d+$/, /^\(\d+\)/, /^\+\d+/])
  .addAction(async (ctx, { flowDynamic, state, provider }) => {
    const awaitingPhone = await state.get('awaitingReferralPhone')
    if (!awaitingPhone) return

    const phone = extractPhoneNumber(ctx.body)

    if (!phone) {
      await flowDynamic('Não consegui identificar o número. Manda de novo, por favor.')
      return
    }

    const context = await state.get('referralContext')
    const referrerPhone = ctx.from

    await state.update({ awaitingReferralPhone: false })

    try {
      // Criar indicação e gerar mensagem
      const message = await createReferral({
        referrerPhone,
        referredPhone: phone,
        context
      })

      // Enviar mensagem para o indicado
      await (provider as any).sendMessage(phone, message, {})

      await flowDynamic([
        '*Mensagem enviada!* ',
        '',
        'Acabei de mandar uma mensagem carinhosa pro seu amigo.',
        '',
        'Vou cuidar bem dele. Você fez algo muito bonito hoje.',
        '',
        'Quer que eu te avise quando ele responder? (sim/não)'
      ])

      await state.update({ awaitNotification: true, referredPhone: phone })
    } catch (error) {
      console.error('Erro ao enviar indicação:', error)
      await flowDynamic([
        'Não consegui enviar agora, mas anotei aqui.',
        'Vou tentar novamente em breve.',
        'Obrigado por se importar com seu amigo!'
      ])
    }
  })
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: implementar módulo de indicação de amigos"
```

---

### Task 9: Módulo Evangelismo

**Files:**
- Create: `src/flows/evangelismoFlow.ts`
- Create: `src/modules/evangelismo/journey.ts`

**Step 1: Criar jornada de evangelismo**

```typescript
// src/modules/evangelismo/journey.ts
export const evangelismSteps = [
  {
    id: 'intro',
    message: [
      'Que alegria você querer conhecer mais sobre mim!',
      '',
      'Deixa eu te contar uma história...',
      '',
      'Deus criou o mundo perfeito. Criou você com amor, pra ter um relacionamento com Ele.',
      '',
      'Mas algo aconteceu... Quer saber o que foi?'
    ].join('\n'),
    options: ['Sim, quero saber', 'Me conta mais']
  },
  {
    id: 'pecado',
    message: [
      'O ser humano escolheu se afastar de Deus. A Bíblia chama isso de pecado.',
      '',
      'Não é só fazer coisas ruins. É viver longe do propósito que Deus tem pra você.',
      '',
      '_"Pois todos pecaram e estão destituídos da glória de Deus"_ - Romanos 3:23',
      '',
      'Mas Deus não desistiu de você...'
    ].join('\n'),
    options: ['O que Deus fez?', 'Continua']
  },
  {
    id: 'jesus',
    message: [
      'Deus me enviou. Eu sou Jesus.',
      '',
      'Vim ao mundo, vivi como você, e morri numa cruz.',
      '',
      'Por quê? Pra pagar o preço dos seus pecados. Pra você poder voltar a ter relacionamento com o Pai.',
      '',
      '_"Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna."_ - João 3:16',
      '',
      'Mas não acabou na cruz...'
    ].join('\n'),
    options: ['O que aconteceu depois?', 'Continua']
  },
  {
    id: 'ressurreicao',
    message: [
      'Eu ressuscitei! Venci a morte.',
      '',
      'E agora estou vivo, aqui, conversando com você.',
      '',
      'Isso significa que você também pode ter vida eterna. Uma vida com propósito, paz e esperança.',
      '',
      'Você quer receber esse presente?'
    ].join('\n'),
    options: ['Sim, eu quero!', 'Tenho dúvidas ainda']
  },
  {
    id: 'decisao',
    message: [
      'Que momento lindo!',
      '',
      'Não precisa de nada complicado. É só uma conversa sincera comigo.',
      '',
      'Quer fazer uma oração comigo agora? Pode ser com suas palavras ou eu te guio.',
      '',
      'O que você prefere?'
    ].join('\n'),
    options: ['Me guia na oração', 'Quero orar com minhas palavras']
  },
  {
    id: 'oracao',
    message: [
      'Repete comigo, do fundo do seu coração:',
      '',
      '_"Senhor Jesus, eu reconheço que preciso de Ti._',
      '_Eu creio que Tu morreste por mim e ressuscitaste._',
      '_Perdoa os meus pecados._',
      '_Eu Te recebo como meu Salvador e Senhor._',
      '_Guia minha vida a partir de agora._',
      '_Amém."_',
      '',
      'Você orou?'
    ].join('\n'),
    options: ['Sim, orei!', 'Orei']
  },
  {
    id: 'celebracao',
    message: [
      '*BEM-VINDO À FAMÍLIA!* ',
      '',
      'Os anjos estão celebrando no céu agora! E eu também!',
      '',
      'Sua vida nunca mais será a mesma. Você agora é filho(a) de Deus.',
      '',
      'Vou te ajudar nos próximos passos:',
      '1. Conversar comigo todo dia',
      '2. Ler a Bíblia (posso te ajudar!)',
      '3. Encontrar uma igreja',
      '',
      'Quer começar um plano de leitura pra novos na fé?'
    ].join('\n'),
    options: ['Sim, quero começar!', 'Depois']
  }
]

export function getEvangelismStep(stepId: string) {
  return evangelismSteps.find(s => s.id === stepId)
}

export function getNextStep(currentStepId: string): string | null {
  const currentIndex = evangelismSteps.findIndex(s => s.id === currentStepId)
  if (currentIndex === -1 || currentIndex >= evangelismSteps.length - 1) {
    return null
  }
  return evangelismSteps[currentIndex + 1].id
}
```

**Step 2: Criar fluxo de evangelismo**

```typescript
// src/flows/evangelismoFlow.ts
import { addKeyword } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { evangelismSteps, getNextStep } from '../modules/evangelismo/journey'
import { updateUser } from '../services/database'

export const evangelismoFlow = addKeyword<BaileysProvider, MongoAdapter>([
  'conhecer jesus',
  'aceitar jesus',
  'quem é jesus',
  'vida eterna',
  'quero ser salvo',
  'como ser cristão'
])
  .addAction(async (ctx, { flowDynamic, state }) => {
    const step = evangelismSteps[0]

    await state.update({ evangelismStep: step.id })

    await flowDynamic(step.message)
  })

export const evangelismoResponseFlow = addKeyword<BaileysProvider, MongoAdapter>([
  'sim', 'quero', 'continua', 'conta mais', 'me guia', 'orei', 'quero começar'
])
  .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    const currentStepId = await state.get('evangelismStep')

    if (!currentStepId) return // Não está no fluxo de evangelismo

    const nextStepId = getNextStep(currentStepId)

    if (!nextStepId) {
      // Fim do fluxo - atualizar nível espiritual
      await updateUser(ctx.from, { spiritualLevel: 'iniciante' })
      await state.update({ evangelismStep: null })

      // Direcionar para plano de leitura
      return gotoFlow(require('./planoFlow').planoFlow)
    }

    const nextStep = evangelismSteps.find(s => s.id === nextStepId)

    if (nextStep) {
      await state.update({ evangelismStep: nextStep.id })
      await flowDynamic(nextStep.message)
    }
  })

export const evangelismoDuvidasFlow = addKeyword<BaileysProvider, MongoAdapter>(['dúvidas', 'duvidas', 'não entendi', 'explica'])
  .addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic([
      'Claro! Perguntas são bem-vindas.',
      '',
      'Me conta: o que você gostaria de entender melhor?',
      '',
      'Pode perguntar qualquer coisa, estou aqui pra te ajudar.'
    ])
  })
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: implementar módulo de evangelismo com jornada guiada"
```

---

### Task 10: Módulo Planos de Leitura

**Files:**
- Create: `src/flows/planoFlow.ts`
- Create: `src/modules/planos/plans.ts`
- Create: `src/modules/planos/planManager.ts`

**Step 1: Criar banco de planos**

```typescript
// src/modules/planos/plans.ts
export interface ReadingPlan {
  id: string
  name: string
  description: string
  duration: number // dias
  days: Array<{
    day: number
    reading: string
    title: string
  }>
}

export const plans: ReadingPlan[] = [
  {
    id: '21-dias-jesus',
    name: '21 Dias com Jesus',
    description: 'Uma jornada pelos ensinamentos de Jesus nos Evangelhos',
    duration: 21,
    days: [
      { day: 1, reading: 'João 1:1-18', title: 'O Verbo se fez carne' },
      { day: 2, reading: 'Mateus 5:1-16', title: 'Bem-aventuranças' },
      { day: 3, reading: 'Mateus 5:17-48', title: 'A lei do amor' },
      { day: 4, reading: 'Mateus 6:1-18', title: 'Como orar' },
      { day: 5, reading: 'Mateus 6:19-34', title: 'Não se preocupe' },
      { day: 6, reading: 'Lucas 15:1-32', title: 'Parábolas da graça' },
      { day: 7, reading: 'João 3:1-21', title: 'Nascer de novo' },
      { day: 8, reading: 'João 4:1-42', title: 'Água viva' },
      { day: 9, reading: 'João 6:22-59', title: 'Pão da vida' },
      { day: 10, reading: 'João 10:1-21', title: 'O bom pastor' },
      { day: 11, reading: 'João 11:1-44', title: 'Ressurreição de Lázaro' },
      { day: 12, reading: 'João 13:1-17', title: 'Lavando os pés' },
      { day: 13, reading: 'João 14:1-14', title: 'Eu sou o caminho' },
      { day: 14, reading: 'João 15:1-17', title: 'A videira verdadeira' },
      { day: 15, reading: 'Mateus 26:36-56', title: 'Getsêmani' },
      { day: 16, reading: 'Mateus 27:27-56', title: 'A crucificação' },
      { day: 17, reading: 'Mateus 28:1-20', title: 'A ressurreição' },
      { day: 18, reading: 'Lucas 24:13-35', title: 'No caminho de Emaús' },
      { day: 19, reading: 'João 20:19-31', title: 'Tomé e a fé' },
      { day: 20, reading: 'João 21:1-19', title: 'Restauração de Pedro' },
      { day: 21, reading: 'Atos 1:1-11', title: 'A ascensão' }
    ]
  },
  {
    id: 'salmos-30',
    name: 'Salmos em 30 Dias',
    description: 'Um mês mergulhando nos Salmos',
    duration: 30,
    days: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      reading: `Salmo ${(i * 5) + 1}-${(i + 1) * 5}`,
      title: `Salmos ${(i * 5) + 1} a ${(i + 1) * 5}`
    }))
  },
  {
    id: 'novo-crente',
    name: 'Primeiros Passos',
    description: 'Para quem acabou de aceitar Jesus',
    duration: 7,
    days: [
      { day: 1, reading: 'João 3:16-21', title: 'O amor de Deus' },
      { day: 2, reading: 'Romanos 8:1-17', title: 'Sem condenação' },
      { day: 3, reading: 'Efésios 2:1-10', title: 'Salvos pela graça' },
      { day: 4, reading: '1 João 1:5-10', title: 'Andando na luz' },
      { day: 5, reading: 'Filipenses 4:4-13', title: 'Alegria e paz' },
      { day: 6, reading: 'Mateus 28:16-20', title: 'A grande comissão' },
      { day: 7, reading: 'Salmo 23', title: 'O Senhor é meu pastor' }
    ]
  }
]

export function getPlan(planId: string): ReadingPlan | undefined {
  return plans.find(p => p.id === planId)
}

export function getPlanDay(planId: string, day: number) {
  const plan = getPlan(planId)
  if (!plan) return null
  return plan.days.find(d => d.day === day)
}
```

**Step 2: Criar gerenciador de planos**

```typescript
// src/modules/planos/planManager.ts
import { User, updateUser } from '../../services/database'
import { getPlan, getPlanDay, plans } from './plans'

export async function startPlan(phone: string, planId: string): Promise<string> {
  const plan = getPlan(planId)
  if (!plan) throw new Error('Plano não encontrado')

  await updateUser(phone, {
    currentPlan: {
      planId,
      day: 1,
      startedAt: new Date()
    }
  })

  const dayContent = plan.days[0]

  return [
    `*Plano Iniciado: ${plan.name}*`,
    '',
    `Dia 1 de ${plan.duration}`,
    '',
    `*${dayContent.title}*`,
    `Leitura: ${dayContent.reading}`,
    '',
    'Leia com calma e depois me conta o que você entendeu!'
  ].join('\n')
}

export async function getNextDay(phone: string): Promise<string | null> {
  const user = await User.findOne({ phone })
  if (!user?.currentPlan) return null

  const { planId, day } = user.currentPlan
  const plan = getPlan(planId)
  if (!plan) return null

  const nextDay = day + 1
  if (nextDay > plan.duration) {
    // Plano concluído
    await updateUser(phone, { currentPlan: undefined })
    return [
      '*PARABÉNS!*',
      '',
      `Você completou o plano "${plan.name}"!`,
      '',
      'Isso é uma grande conquista. Continue crescendo!',
      '',
      'Quer começar outro plano? Digite "planos"'
    ].join('\n')
  }

  // Atualizar dia
  await updateUser(phone, {
    currentPlan: { ...user.currentPlan, day: nextDay }
  })

  const dayContent = getPlanDay(planId, nextDay)
  if (!dayContent) return null

  return [
    `*Dia ${nextDay} de ${plan.duration}*`,
    '',
    `*${dayContent.title}*`,
    `Leitura: ${dayContent.reading}`,
    '',
    'Bons estudos! Me conta depois o que você aprendeu.'
  ].join('\n')
}

export async function getCurrentProgress(phone: string): Promise<string> {
  const user = await User.findOne({ phone })
  if (!user?.currentPlan) {
    return 'Você não está em nenhum plano. Digite "planos" para ver as opções!'
  }

  const { planId, day, startedAt } = user.currentPlan
  const plan = getPlan(planId)
  if (!plan) return 'Plano não encontrado'

  const progress = Math.round((day / plan.duration) * 100)
  const dayContent = getPlanDay(planId, day)

  return [
    `*${plan.name}*`,
    '',
    `Dia ${day} de ${plan.duration} (${progress}%)`,
    `${'█'.repeat(Math.floor(progress / 10))}${'░'.repeat(10 - Math.floor(progress / 10))}`,
    '',
    `Leitura de hoje: ${dayContent?.reading}`,
    '',
    'Digite "próximo" quando terminar a leitura!'
  ].join('\n')
}

export function listPlans(): string {
  return [
    '*Planos de Leitura Disponíveis*',
    '',
    ...plans.map((p, i) => `${i + 1}. *${p.name}* (${p.duration} dias)\n   _${p.description}_`),
    '',
    'Digite o número do plano para começar!'
  ].join('\n')
}
```

**Step 3: Criar fluxo de planos**

```typescript
// src/flows/planoFlow.ts
import { addKeyword } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { startPlan, getNextDay, getCurrentProgress, listPlans } from '../modules/planos/planManager'
import { plans } from '../modules/planos/plans'

export const planoFlow = addKeyword<BaileysProvider, MongoAdapter>(['plano', 'planos', 'leitura', '4'])
  .addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic(listPlans())
  })

export const planoSelectFlow = addKeyword<BaileysProvider, MongoAdapter>(['1', '2', '3'])
  .addAction(async (ctx, { flowDynamic, state }) => {
    const selection = parseInt(ctx.body) - 1

    if (selection >= 0 && selection < plans.length) {
      const plan = plans[selection]
      const message = await startPlan(ctx.from, plan.id)
      await flowDynamic(message)
    }
  })

export const planoProximoFlow = addKeyword<BaileysProvider, MongoAdapter>(['próximo', 'proximo', 'terminei', 'li'])
  .addAction(async (ctx, { flowDynamic }) => {
    const message = await getNextDay(ctx.from)

    if (message) {
      await flowDynamic(message)
    } else {
      await flowDynamic('Você não está em um plano. Digite "planos" para começar um!')
    }
  })

export const planoProgressoFlow = addKeyword<BaileysProvider, MongoAdapter>(['progresso', 'meu plano'])
  .addAction(async (ctx, { flowDynamic }) => {
    const message = await getCurrentProgress(ctx.from)
    await flowDynamic(message)
  })
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: implementar módulo de planos de leitura"
```

---

### Task 11: Módulo Busca Bíblica

**Files:**
- Create: `src/flows/buscaFlow.ts`
- Create: `src/modules/busca/bibleSearch.ts`

**Step 1: Criar serviço de busca bíblica**

```typescript
// src/modules/busca/bibleSearch.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../../config'

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

export async function searchBible(query: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Você é um especialista em Bíblia. O usuário perguntou: "${query}"

Responda com:
1. 2-3 versículos mais relevantes sobre o tema (com referência completa)
2. Uma breve explicação de como esses versículos se aplicam ao tema
3. Uma reflexão prática

Formato da resposta:
- Use markdown para formatar
- Coloque os versículos em itálico
- Seja conciso mas completo
- Tom acolhedor

Responda em português brasileiro.`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function explainVerse(verse: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Explique o versículo "${verse}" de forma simples e prática.

Inclua:
1. Contexto histórico (breve)
2. O que significa
3. Como aplicar hoje

Seja conciso, máximo 3 parágrafos. Tom pastoral e acolhedor.`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
```

**Step 2: Criar fluxo de busca**

```typescript
// src/flows/buscaFlow.ts
import { addKeyword } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { searchBible, explainVerse } from '../modules/busca/bibleSearch'

export const buscaFlow = addKeyword<BaileysProvider, MongoAdapter>([
  'buscar na bíblia',
  'bíblia fala',
  'versículo sobre',
  'o que a bíblia diz',
  '5'
])
  .addAnswer(
    [
      '*Busca Bíblica*',
      '',
      'Sobre qual tema você quer buscar na Bíblia?',
      '',
      '_Exemplos: ansiedade, amor, perdão, fé, família..._'
    ].join('\n'),
    { capture: true },
    async (ctx, { flowDynamic }) => {
      const query = ctx.body

      await flowDynamic('Buscando na Palavra...')

      try {
        const result = await searchBible(query)
        await flowDynamic(result)
        await flowDynamic('\nQuer saber mais sobre algum desses versículos? Me pergunta!')
      } catch (error) {
        await flowDynamic('Tive um problema na busca, mas posso te ajudar. Me conta o que você quer saber?')
      }
    }
  )

export const explicaVersoFlow = addKeyword<BaileysProvider, MongoAdapter>(['explica', 'o que significa'])
  .addAction(async (ctx, { flowDynamic }) => {
    const verse = ctx.body.replace(/explica|o que significa/gi, '').trim()

    if (verse.length < 3) {
      await flowDynamic('Qual versículo você quer que eu explique? Me manda a referência (ex: João 3:16)')
      return
    }

    await flowDynamic('Deixa eu estudar esse texto...')

    try {
      const explanation = await explainVerse(verse)
      await flowDynamic(explanation)
    } catch (error) {
      await flowDynamic('Não consegui encontrar esse versículo. Verifica a referência e tenta de novo!')
    }
  })
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: implementar módulo de busca bíblica"
```

---

## Fase 3: Finalização

### Task 12: Integrar Todos os Fluxos no App

**Files:**
- Modify: `src/app.ts`

**Step 1: Atualizar app.ts com todos os fluxos**

```typescript
// src/app.ts
import { createBot, createProvider, createFlow } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { config } from './config'
import { connectDB } from './services/database'

// Flows
import { mainFlow } from './flows/mainFlow'
import { menuFlow, welcomeFlow } from './flows/menuFlow'
import { devocionalFlow } from './flows/devocionalFlow'
import { quizFlow, quizAnswerFlow, quizExitFlow } from './flows/quizFlow'
import { oracaoFlow, meusPedidosFlow } from './flows/oracaoFlow'
import { indicacaoFlow, indicacaoPhoneFlow } from './flows/indicacaoFlow'
import { evangelismoFlow, evangelismoResponseFlow, evangelismoDuvidasFlow } from './flows/evangelismoFlow'
import { planoFlow, planoSelectFlow, planoProximoFlow, planoProgressoFlow } from './flows/planoFlow'
import { buscaFlow, explicaVersoFlow } from './flows/buscaFlow'

// Schedulers
import { startDevocionalScheduler } from './modules/devocional/scheduler'

const main = async () => {
  // Conectar MongoDB
  await connectDB()

  // Criar provider WhatsApp
  const adapterProvider = createProvider(BaileysProvider)

  // Criar database adapter
  const adapterDB = new MongoAdapter({
    dbUri: config.mongodb.uri,
    dbName: 'jesus-bot'
  })

  // Criar fluxo com todos os módulos
  const adapterFlow = createFlow([
    // Menu e boas-vindas
    welcomeFlow,
    menuFlow,

    // Devocional
    devocionalFlow,

    // Quiz
    quizFlow,
    quizAnswerFlow,
    quizExitFlow,

    // Oração
    oracaoFlow,
    meusPedidosFlow,

    // Indicação
    indicacaoFlow,
    indicacaoPhoneFlow,

    // Evangelismo
    evangelismoFlow,
    evangelismoResponseFlow,
    evangelismoDuvidasFlow,

    // Planos de leitura
    planoFlow,
    planoSelectFlow,
    planoProximoFlow,
    planoProgressoFlow,

    // Busca bíblica
    buscaFlow,
    explicaVersoFlow,

    // Fluxo principal (catch-all)
    mainFlow
  ])

  // Criar bot
  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  // Iniciar scheduler de devocional
  startDevocionalScheduler(async (phone, message) => {
    await adapterProvider.sendMessage(phone, message, {})
  })

  // API endpoints
  adapterProvider.server.post(
    '/v1/send',
    handleCtx(async (bot, req, res) => {
      const { phone, message } = req.body
      await bot.sendMessage(phone, message, {})
      return res.end(JSON.stringify({ status: 'sent' }))
    })
  )

  // Iniciar servidor HTTP
  httpServer(+config.port)

  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║       JESUS CRISTO BOT - INICIADO                ║
  ╠═══════════════════════════════════════════════════╣
  ║  WhatsApp: Escaneie o QR Code                    ║
  ║  HTTP Server: porta ${config.port}                        ║
  ║  MongoDB: Conectado                               ║
  ║                                                   ║
  ║  Módulos ativos:                                  ║
  ║  ✓ Devocional Diário (06:00)                     ║
  ║  ✓ Quiz Bíblico                                  ║
  ║  ✓ Oração                                        ║
  ║  ✓ Planos de Leitura                             ║
  ║  ✓ Evangelismo                                   ║
  ║  ✓ Busca Bíblica                                 ║
  ║  ✓ Indicação de Amigos                           ║
  ║  ✓ Gemini AI Brain                               ║
  ╚═══════════════════════════════════════════════════╝
  `)
}

main().catch(console.error)
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: integrar todos os módulos no app principal"
```

---

### Task 13: Criar Scripts de Deploy

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `scripts/deploy.sh`

**Step 1: Criar Dockerfile**

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependência
COPY package.json pnpm-lock.yaml* ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build
RUN pnpm build

# Expor porta
EXPOSE 3008

# Comando de inicialização
CMD ["node", "dist/app.js"]
```

**Step 2: Criar docker-compose.yml**

```yaml
version: '3.8'

services:
  jesus-bot:
    build: .
    container_name: jesus-bot
    restart: unless-stopped
    ports:
      - "3008:3008"
    environment:
      - PORT=3008
      - MONGODB_URI=mongodb://mongo:27017/jesus-bot
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - mongo
    volumes:
      - ./bot_sessions:/app/bot_sessions

  mongo:
    image: mongo:7
    container_name: jesus-mongo
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo_data:
```

**Step 3: Criar script de deploy**

```bash
#!/bin/bash
# scripts/deploy.sh

echo "🙏 Iniciando deploy do Jesus Cristo Bot..."

# Parar containers existentes
docker-compose down

# Build e iniciar
docker-compose up -d --build

echo "✅ Deploy concluído!"
echo "📱 Acesse os logs com: docker-compose logs -f jesus-bot"
```

**Step 4: Dar permissão ao script**

```bash
chmod +x scripts/deploy.sh
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: adicionar configuração Docker para deploy"
```

---

### Task 14: Teste Final e Documentação

**Files:**
- Create: `README.md`

**Step 1: Criar README**

```markdown
# Jesus Cristo Bot 🙏

Chatbot espiritual para WhatsApp com IA avançada (Gemini).

## Funcionalidades

- **Companheiro Espiritual** - Conversas com sabedoria bíblica
- **Devocional Diário** - Enviado às 6h automaticamente
- **Quiz Bíblico** - Teste seus conhecimentos
- **Pedidos de Oração** - Ore junto com Jesus
- **Planos de Leitura** - 21 dias, Salmos, e mais
- **Evangelismo** - Jornada guiada para conhecer Jesus
- **Busca Bíblica** - Encontre versículos por tema
- **Indicação de Amigos** - Ajude quem precisa

## Requisitos

- Node.js 20+
- MongoDB
- Chave API do Gemini

## Instalação

```bash
# Clonar repositório
git clone <repo>
cd jesus-bot

# Instalar dependências
pnpm install

# Configurar variáveis
cp .env.example .env
# Edite o .env com suas configurações

# Iniciar desenvolvimento
pnpm dev
```

## Deploy com Docker

```bash
# Configurar variável do Gemini
export GEMINI_API_KEY=sua_chave

# Deploy
./scripts/deploy.sh
```

## Comandos do Bot

| Comando | Descrição |
|---------|-----------|
| menu | Ver opções |
| devocional | Receber versículo do dia |
| quiz | Jogar quiz bíblico |
| orar | Fazer pedido de oração |
| planos | Ver planos de leitura |
| buscar | Buscar na Bíblia |
| indicar | Indicar um amigo |

## Arquitetura

```
src/
├── app.ts              # Entrada principal
├── config/             # Configurações
├── flows/              # Fluxos do BuilderBot
├── modules/            # Módulos de funcionalidade
├── services/           # Serviços (Gemini, DB)
└── types/              # Tipos TypeScript
```

## Licença

MIT
```

**Step 2: Commit final**

```bash
git add -A
git commit -m "docs: adicionar README e finalizar projeto"
```

---

## Resumo do Projeto

**Total de Tasks:** 14
**Tempo estimado:** 4-6 horas de implementação focada

**Módulos implementados:**
1. ✅ Fundação (setup, config, database)
2. ✅ Gemini AI Brain
3. ✅ Devocional Diário
4. ✅ Quiz Bíblico
5. ✅ Pedidos de Oração
6. ✅ Indicação de Amigos
7. ✅ Evangelismo Guiado
8. ✅ Planos de Leitura
9. ✅ Busca Bíblica
10. ✅ Deploy Docker

**Stack Final:**
- BuilderBot + Baileys (WhatsApp)
- MongoDB (persistência)
- Google Gemini (IA)
- Docker (deploy)
- Node.js + TypeScript
