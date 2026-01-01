import { createBot, createProvider, createFlow } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { MongoAdapter } from '@builderbot/database-mongo'
import { config } from './config'
import { connectDB, confirmPurchaseAndAddCredits } from './services/database'
import { parseWebhookPayload } from './services/wooviPix'
import qrcode from 'qrcode-terminal'

// Flows
import { welcomeFlow } from './flows/welcomeFlow'
import { menuFlow } from './flows/menuFlow'
import { criarMusicaFlow, criarMusicaActionFlow } from './flows/criarMusicaFlow'
import { minhasMusicasFlow, reenviarMusicaFlow } from './flows/minhasMusicasFlow'
import { comprarCreditosFlow, selecionarPacoteFlow, verificarPagamentoFlow } from './flows/comprarCreditosFlow'
import { mainFlow } from './flows/mainFlow'

const main = async () => {
  await connectDB()

  const adapterProvider = createProvider(BaileysProvider, {
    gifPlayback: true,
    usePairingCode: false,
    browser: ['Musico.AI Bot', 'Chrome', '120.0.0'],
    printQRInTerminal: true,
  })

  // QR Code event listener
  adapterProvider.on('require_action', async (ctx: { title?: string; instructions?: string[]; payload?: { qr?: string } }) => {
    if (ctx.payload?.qr) {
      console.log('\n📱 ESCANEIE O QR CODE COM O WHATSAPP:\n')
      qrcode.generate(ctx.payload.qr, { small: true })
    }
  })

  const adapterDB = new MongoAdapter({
    dbUri: config.mongodb.uri,
    dbName: 'musico-bot'
  })

  const adapterFlow = createFlow([
    // Specific flows first (order matters!)
    welcomeFlow,
    menuFlow,
    criarMusicaFlow,
    criarMusicaActionFlow,
    minhasMusicasFlow,
    reenviarMusicaFlow,
    comprarCreditosFlow,
    selecionarPacoteFlow,
    verificarPagamentoFlow,
    // Main flow last (catch-all)
    mainFlow
  ])

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  // Webhook for Woovi PIX payment confirmation
  adapterProvider.server.post('/webhook/woovi', async (req: any, res: any) => {
    try {
      const payload = req.body
      const result = parseWebhookPayload(payload)

      if (result && result.event === 'OPENPIX:TRANSACTION_RECEIVED') {
        const confirmed = await confirmPurchaseAndAddCredits(result.correlationId)
        if (confirmed) {
          // Send confirmation message
          await adapterProvider.sendMessage(
            confirmed.phone,
            `✅ *Pagamento confirmado!*\n\n+${confirmed.credits} crédito${confirmed.credits > 1 ? 's' : ''} adicionado${confirmed.credits > 1 ? 's' : ''}!\n\nDigite *criar* para fazer sua música! 🎵`,
            {}
          )
        }
      }

      res.status(200).json({ success: true })
    } catch (error) {
      console.error('[WEBHOOK] Erro:', error)
      res.status(500).json({ error: 'Internal error' })
    }
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
  ║       MUSICO.AI BOT - INICIADO                   ║
  ╠═══════════════════════════════════════════════════╣
  ║  WhatsApp: Escaneie o QR Code                    ║
  ║  HTTP Server: porta ${config.port}                        ║
  ║  MongoDB: Conectado                               ║
  ║                                                   ║
  ║  Modulos ativos:                                  ║
  ║  * Criar Musica    * Minhas Musicas               ║
  ║  * Comprar Creditos * Webhook Woovi PIX           ║
  ╚═══════════════════════════════════════════════════╝
  `)
}

main().catch(console.error)
