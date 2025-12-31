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
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
// Flows
const mainFlow_1 = require("./flows/mainFlow");
const menuFlow_1 = require("./flows/menuFlow");
const devocionalFlow_1 = require("./flows/devocionalFlow");
const quizFlow_1 = require("./flows/quizFlow");
const oracaoFlow_1 = require("./flows/oracaoFlow");
const indicacaoFlow_1 = require("./flows/indicacaoFlow");
const evangelismoFlow_1 = require("./flows/evangelismoFlow");
const planoFlow_1 = require("./flows/planoFlow");
const buscaFlow_1 = require("./flows/buscaFlow");
// Scheduler
const scheduler_1 = require("./modules/devocional/scheduler");
const main = async () => {
    await (0, database_1.connectDB)();
    const adapterProvider = (0, bot_1.createProvider)(provider_baileys_1.BaileysProvider, {
        gifPlayback: true,
        usePairingCode: false,
        browser: ['Jesus Bot', 'Chrome', '120.0.0'],
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
        dbName: 'jesus-bot'
    });
    const adapterFlow = (0, bot_1.createFlow)([
        // Specific flows first (order matters!)
        menuFlow_1.welcomeFlow,
        menuFlow_1.menuFlow,
        devocionalFlow_1.devocionalFlow,
        quizFlow_1.quizFlow,
        quizFlow_1.quizAnswerFlow,
        quizFlow_1.quizExitFlow,
        oracaoFlow_1.oracaoFlow,
        oracaoFlow_1.meusPedidosFlow,
        indicacaoFlow_1.indicacaoFlow,
        indicacaoFlow_1.indicacaoPhoneFlow,
        evangelismoFlow_1.evangelismoFlow,
        evangelismoFlow_1.evangelismoResponseFlow,
        planoFlow_1.planoFlow,
        planoFlow_1.planoSelectFlow,
        planoFlow_1.planoProximoFlow,
        buscaFlow_1.buscaFlow,
        // Main flow last (catch-all)
        mainFlow_1.mainFlow
    ]);
    const { handleCtx, httpServer } = await (0, bot_1.createBot)({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });
    // Start scheduler
    (0, scheduler_1.startDevocionalScheduler)(async (phone, message) => {
        await adapterProvider.sendMessage(phone, message, {});
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
  ║       JESUS CRISTO BOT - INICIADO                ║
  ╠═══════════════════════════════════════════════════╣
  ║  WhatsApp: Escaneie o QR Code                    ║
  ║  HTTP Server: porta ${config_1.config.port}                        ║
  ║  MongoDB: Conectado                               ║
  ║                                                   ║
  ║  Módulos ativos:                                  ║
  ║  ✓ Devocional (06:00)  ✓ Quiz      ✓ Oração     ║
  ║  ✓ Planos             ✓ Evangelismo ✓ Busca     ║
  ║  ✓ Indicação          ✓ Gemini AI               ║
  ╚═══════════════════════════════════════════════════╝
  `);
};
main().catch(console.error);
//# sourceMappingURL=app.js.map