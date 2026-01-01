"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("@builderbot/bot");
const provider_baileys_1 = require("@builderbot/provider-baileys");
const database_mongo_1 = require("@builderbot/database-mongo");
const config_1 = require("./config");
const database_1 = require("./services/database");
const wooviPix_1 = require("./services/wooviPix");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
// Flows
const welcomeFlow_1 = require("./flows/welcomeFlow");
const menuFlow_1 = require("./flows/menuFlow");
const criarMusicaFlow_1 = require("./flows/criarMusicaFlow");
const minhasMusicasFlow_1 = require("./flows/minhasMusicasFlow");
const comprarCreditosFlow_1 = require("./flows/comprarCreditosFlow");
const mainFlow_1 = require("./flows/mainFlow");
const main = async () => {
    await (0, database_1.connectDB)();
    const adapterProvider = (0, bot_1.createProvider)(provider_baileys_1.BaileysProvider, {
        gifPlayback: true,
        usePairingCode: false,
        browser: ['Musico.AI Bot', 'Chrome', '120.0.0'],
        printQRInTerminal: true,
    });
    // QR Code event listener
    adapterProvider.on('require_action', async (ctx) => {
        if (ctx.payload?.qr) {
            console.log('\n📱 ESCANEIE O QR CODE COM O WHATSAPP:\n');
            qrcode_terminal_1.default.generate(ctx.payload.qr, { small: true });
        }
    });
    const adapterDB = new database_mongo_1.MongoAdapter({
        dbUri: config_1.config.mongodb.uri,
        dbName: 'musico-bot'
    });
    const adapterFlow = (0, bot_1.createFlow)([
        // Specific flows first (order matters!)
        welcomeFlow_1.welcomeFlow,
        menuFlow_1.menuFlow,
        criarMusicaFlow_1.criarMusicaFlow,
        criarMusicaFlow_1.criarMusicaActionFlow,
        minhasMusicasFlow_1.minhasMusicasFlow,
        minhasMusicasFlow_1.reenviarMusicaFlow,
        comprarCreditosFlow_1.comprarCreditosFlow,
        comprarCreditosFlow_1.selecionarPacoteFlow,
        comprarCreditosFlow_1.verificarPagamentoFlow,
        // Main flow last (catch-all)
        mainFlow_1.mainFlow
    ]);
    const { handleCtx, httpServer } = await (0, bot_1.createBot)({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });
    // Webhook for Woovi PIX payment confirmation
    adapterProvider.server.post('/webhook/woovi', async (req, res) => {
        try {
            const payload = req.body;
            const result = (0, wooviPix_1.parseWebhookPayload)(payload);
            if (result && result.event === 'OPENPIX:TRANSACTION_RECEIVED') {
                const confirmed = await (0, database_1.confirmPurchaseAndAddCredits)(result.correlationId);
                if (confirmed) {
                    // Send confirmation message
                    await adapterProvider.sendMessage(confirmed.phone, `✅ *Pagamento confirmado!*\n\n+${confirmed.credits} crédito${confirmed.credits > 1 ? 's' : ''} adicionado${confirmed.credits > 1 ? 's' : ''}!\n\nDigite *criar* para fazer sua música! 🎵`, {});
                }
            }
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('[WEBHOOK] Erro:', error);
            res.status(500).json({ error: 'Internal error' });
        }
    });
    // API endpoints
    adapterProvider.server.post('/v1/send', handleCtx(async (bot, req, res) => {
        const { phone, message } = req.body;
        if (bot) {
            await bot.sendMessage(phone, message, {});
        }
        return res.end(JSON.stringify({ status: 'sent' }));
    }));
    httpServer(+config_1.config.port);
    console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║       MUSICO.AI BOT - INICIADO                   ║
  ╠═══════════════════════════════════════════════════╣
  ║  WhatsApp: Escaneie o QR Code                    ║
  ║  HTTP Server: porta ${config_1.config.port}                        ║
  ║  MongoDB: Conectado                               ║
  ║                                                   ║
  ║  Modulos ativos:                                  ║
  ║  * Criar Musica    * Minhas Musicas               ║
  ║  * Comprar Creditos * Webhook Woovi PIX           ║
  ╚═══════════════════════════════════════════════════╝
  `);
};
main().catch(console.error);
//# sourceMappingURL=app.js.map