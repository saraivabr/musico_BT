"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuFlow = void 0;
const bot_1 = require("@builderbot/bot");
const database_1 = require("../services/database");
exports.menuFlow = (0, bot_1.addKeyword)(['menu', 'ajuda', 'help', 'opcoes', 'opções'])
    .addAction(async (ctx, { flowDynamic }) => {
    const phone = ctx.from;
    const user = await (0, database_1.getOrCreateUser)(phone);
    const credits = user.credits || 0;
    await flowDynamic([
        `🎵 *Saraiva* - Menu Principal 🎤\n\n💰 *Seus créditos:* ${credits}\n\n📋 *O que você deseja fazer?*\n\n1️⃣ *Criar música* - Componha sua próxima hit\n2️⃣ *Minhas músicas* - Veja suas criações\n3️⃣ *Comprar créditos* - Adquira mais créditos\n\nDigite o número da opção desejada! 🎶`
    ]);
});
//# sourceMappingURL=menuFlow.js.map