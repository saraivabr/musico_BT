"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscaFlow = void 0;
const bot_1 = require("@builderbot/bot");
const bibleSearch_1 = require("../modules/busca/bibleSearch");
exports.buscaFlow = (0, bot_1.addKeyword)(['playbook', 'copy', 'modelo', 'roteiro', '5'])
    .addAnswer('*Playbooks e Copys*\n\nSobre qual nicho/objeção quer um exemplo?\n\n_Ex: infoproduto high ticket, SaaS B2B, serviço local..._', { capture: true }, async (ctx, { flowDynamic }) => {
    await flowDynamic('Montando sugestão de playbook...');
    const result = await (0, bibleSearch_1.searchBible)(ctx.body);
    await flowDynamic(result);
    await flowDynamic('Quer aplicar isso comigo em 15min? Tenho janela hoje 14:30 ou amanhã 9:00.');
});
//# sourceMappingURL=buscaFlow.js.map