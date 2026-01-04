"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meusPedidosFlow = exports.oracaoFlow = void 0;
const bot_1 = require("@builderbot/bot");
const prayerManager_1 = require("../modules/oracao/prayerManager");
exports.oracaoFlow = (0, bot_1.addKeyword)(['estrategia', 'plano', 'proposta', 'briefing', '3'])
    .addAnswer('*Estratégia agora*\n\nMe conta rapidamente o contexto (nicho, oferta, principal dor/objetivo).\n\nVou devolver um microplano em bullets e sugerir um horário de 15min pra alinharmos.', { capture: true }, async (ctx, { flowDynamic }) => {
    const request = ctx.body;
    await flowDynamic('Processando seu contexto...');
    try {
        const prayer = await (0, prayerManager_1.addPrayerRequest)(ctx.from, request);
        await flowDynamic([
            '*Plano imediato:*',
            '',
            `_${prayer}_`,
            '',
            'Feito.',
            '',
            'Seu briefing ficou salvo. Topa um call de 15min? Hoje 14:30 ou amanhã 9:00?'
        ]);
    }
    catch {
        await flowDynamic('Recebi seu pedido. Estou montando seu plano. Me diz um horário de 15min (hoje ou amanhã).');
    }
});
exports.meusPedidosFlow = (0, bot_1.addKeyword)(['meus pedidos', 'meus briefs', 'briefings'])
    .addAction(async (ctx, { flowDynamic }) => {
    const requests = await (0, prayerManager_1.getPrayerRequests)(ctx.from);
    if (requests.length === 0) {
        await flowDynamic('Voce nao tem pedidos ativos. Digite "estrategia" para enviar um!');
        return;
    }
    const list = requests
        .map((r, i) => `${i + 1}. "${r.request}"`)
        .join('\n');
    await flowDynamic([
        '*Seus Briefings Acelera>AI*',
        '',
        list,
        '',
        'Quer que eu refine algum deles? Posso ajustar ao vivo em 15min - qual horário?'
    ]);
});
//# sourceMappingURL=oracaoFlow.js.map