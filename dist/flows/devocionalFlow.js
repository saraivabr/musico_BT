"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devocionalFlow = void 0;
const bot_1 = require("@builderbot/bot");
const gemini_1 = require("../services/gemini");
exports.devocionalFlow = (0, bot_1.addKeyword)(['devocional', 'versículo', 'versiculo', 'palavra do dia', '1'])
    .addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic('Preparando seu devocional de hoje...');
    const { versiculo, reflexao } = await (0, gemini_1.generateDevocional)();
    await flowDynamic([
        '*Devocional do Dia*',
        '',
        `_"${versiculo}"_`,
        '',
        reflexao,
        '',
        'Que esse versículo te abençoe hoje!'
    ]);
});
//# sourceMappingURL=devocionalFlow.js.map