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
import { evangelismoFlow, evangelismoResponseFlow } from './flows/evangelismoFlow'
import { planoFlow, planoSelectFlow, planoProximoFlow } from './flows/planoFlow'
import { buscaFlow } from './flows/buscaFlow'

// Scheduler
import { startDevocionalScheduler } from './modules/devocional/scheduler'

const main = async () => {
  await connectDB()

  const adapterProvider = createProvider(BaileysProvider)

  const adapterDB = new MongoAdapter({
    dbUri: config.mongodb.uri,
    dbName: 'jesus-bot'
  })

  const adapterFlow = createFlow([
    // Specific flows first (order matters!)
    welcomeFlow,
    menuFlow,
    devocionalFlow,
    quizFlow,
    quizAnswerFlow,
    quizExitFlow,
    oracaoFlow,
    meusPedidosFlow,
    indicacaoFlow,
    indicacaoPhoneFlow,
    evangelismoFlow,
    evangelismoResponseFlow,
    planoFlow,
    planoSelectFlow,
    planoProximoFlow,
    buscaFlow,
    // Main flow last (catch-all)
    mainFlow
  ])

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  // Start scheduler
  startDevocionalScheduler(async (phone, message) => {
    await adapterProvider.sendMessage(phone, message, {})
  })

  // API endpoints
  adapterProvider.server.post(
    '/v1/send',
    handleCtx(async (bot, req, res) => {
      const { phone, message } = req.body
      if (bot) {
        await bot.sendMessage(phone, message, {})
      }
      return res.end(JSON.stringify({ status: 'sent' }))
    })
  )

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
  ║  ✓ Devocional (06:00)  ✓ Quiz      ✓ Oração     ║
  ║  ✓ Planos             ✓ Evangelismo ✓ Busca     ║
  ║  ✓ Indicação          ✓ Gemini AI               ║
  ╚═══════════════════════════════════════════════════╝
  `)
}

main().catch(console.error)
