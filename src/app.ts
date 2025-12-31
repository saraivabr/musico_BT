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

// Modules
import { startDevocionalScheduler } from './modules/devocional/scheduler'

const main = async () => {
  // Connect MongoDB
  await connectDB()

  // Create WhatsApp provider
  const adapterProvider = createProvider(BaileysProvider)

  // Create database adapter
  const adapterDB = new MongoAdapter({
    dbUri: config.mongodb.uri,
    dbName: 'jesus-bot'
  })

  // Create flow
  const adapterFlow = createFlow([
    welcomeFlow,
    menuFlow,
    devocionalFlow,
    quizFlow,
    quizAnswerFlow,
    quizExitFlow,
    oracaoFlow,
    meusPedidosFlow,
    mainFlow
  ])

  // Create bot
  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  // Start HTTP server
  httpServer(+config.port)

  // Start devocional scheduler
  startDevocionalScheduler(async (phone: string, message: string) => {
    await adapterProvider.sendMessage(phone, message, {})
  })

  console.log(`
  ╔════════════════════════════════════════╗
  ║     JESUS CRISTO BOT - INICIADO       ║
  ╠════════════════════════════════════════╣
  ║  WhatsApp: Aguardando QR Code...      ║
  ║  HTTP Server: porta ${config.port}              ║
  ╚════════════════════════════════════════╝
  `)
}

main().catch(console.error)
