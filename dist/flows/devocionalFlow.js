"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devocionalFlow = void 0;
const bot_1 = require("@builderbot/bot");
const gemini_1 = require("../services/gemini");
exports.devocionalFlow = (0, bot_1.addKeyword)(['pilula', 'pílula', 'dica', 'acelera', '1'])
    .addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic('Gerando sua pílula Acelera>AI de hoje...');
    const { headline, insight, nextStep } = await (0, gemini_1.generateDevocional)();
    await flowDynamic([
        '*Pílula Acelera>AI*',
        '',
        `_${headline}_`,
        '',
        insight,
        '',
        `Próximo passo: ${nextStep}`,
        '',
        'Qual horário de 15min hoje ou amanhã pra alinharmos isso?'
    ]);
});
//# sourceMappingURL=devocionalFlow.js.map