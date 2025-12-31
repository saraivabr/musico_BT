"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meusPedidosFlow = exports.oracaoFlow = void 0;
const bot_1 = require("@builderbot/bot");
const prayerManager_1 = require("../modules/oracao/prayerManager");
exports.oracaoFlow = (0, bot_1.addKeyword)(['oracao', 'orar', 'ora comigo', '3'])
    .addAnswer('*Oracao*\n\nEstou aqui para orar com voce.\n\nMe conta: qual e seu pedido de oracao?', { capture: true }, async (ctx, { flowDynamic }) => {
    const request = ctx.body;
    await flowDynamic('Recebendo seu pedido no coracao...');
    try {
        const prayer = await (0, prayerManager_1.addPrayerRequest)(ctx.from, request);
        await flowDynamic([
            '*Vamos orar juntos:*',
            '',
            `_${prayer}_`,
            '',
            'Amem.',
            '',
            'Seu pedido foi guardado. Vou te lembrar em breve!'
        ]);
    }
    catch {
        await flowDynamic('Recebi seu pedido. Estou orando por voce!');
    }
});
exports.meusPedidosFlow = (0, bot_1.addKeyword)(['meus pedidos', 'pedidos de oracao'])
    .addAction(async (ctx, { flowDynamic }) => {
    const requests = await (0, prayerManager_1.getPrayerRequests)(ctx.from);
    if (requests.length === 0) {
        await flowDynamic('Voce nao tem pedidos ativos. Digite "orar" para fazer um!');
        return;
    }
    const list = requests
        .map((r, i) => `${i + 1}. "${r.request}"`)
        .join('\n');
    await flowDynamic([
        '*Seus Pedidos de Oracao*',
        '',
        list,
        '',
        'Continuo orando por voce!'
    ]);
});
//# sourceMappingURL=oracaoFlow.js.map