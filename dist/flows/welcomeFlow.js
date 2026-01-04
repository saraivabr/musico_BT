"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeFlow = void 0;
const bot_1 = require("@builderbot/bot");
const database_1 = require("../services/database");
exports.welcomeFlow = (0, bot_1.addKeyword)(bot_1.EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic }) => {
    const phone = ctx.from;
    const user = await (0, database_1.getOrCreateUser)(phone);
    const credits = user.credits || 0;
    await flowDynamic([
        `🎵 *Saraiva* - Seu Compositor de Hits! 🎤\n\nOlá! Bem-vindo ao Saraiva, seu assistente musical!\n\nAqui você pode criar músicas incríveis com inteligência artificial. Basta descrever o que você quer e a mágica acontece! ✨`,
        `💰 *Seus créditos:* ${credits}\n\n📋 *Menu de Opções:*\n\n1️⃣ *Criar música* - Componha sua próxima hit\n2️⃣ *Minhas músicas* - Veja suas criações\n3️⃣ *Comprar créditos* - Adquira mais créditos\n\nDigite o número da opção desejada ou escreva *menu* a qualquer momento para ver estas opções novamente.`
    ]);
});
//# sourceMappingURL=welcomeFlow.js.map