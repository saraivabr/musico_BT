"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscaFlow = void 0;
const bot_1 = require("@builderbot/bot");
const bibleSearch_1 = require("../modules/busca/bibleSearch");
exports.buscaFlow = (0, bot_1.addKeyword)(['buscar', 'bíblia fala', 'versículo sobre', '5'])
    .addAnswer('*Busca Bíblica*\n\nSobre qual tema quer buscar?\n\n_Ex: ansiedade, amor, perdão..._', { capture: true }, async (ctx, { flowDynamic }) => {
    await flowDynamic('Buscando na Palavra...');
    const result = await (0, bibleSearch_1.searchBible)(ctx.body);
    await flowDynamic(result);
});
//# sourceMappingURL=buscaFlow.js.map