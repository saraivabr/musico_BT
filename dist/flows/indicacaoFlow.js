"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indicacaoPhoneFlow = exports.indicacaoFlow = void 0;
const bot_1 = require("@builderbot/bot");
const referralManager_1 = require("../modules/indicacao/referralManager");
exports.indicacaoFlow = (0, bot_1.addKeyword)(['indicar', 'lead', 'parceiro', '7'])
    .addAnswer('*Indicar lead ou parceiro*\n\nVou abordar de forma consultiva com o método Acelera>AI (Saraiva.AI).\n\nMe conta: qual é o nome e o contexto (nicho, oferta, urgência)?', { capture: true }, async (ctx, { flowDynamic, state }) => {
    await state.update({ referralContext: ctx.body, awaitingReferralPhone: true });
    await flowDynamic('Entendi. Agora me manda o número de WhatsApp dela.\n\n_Formato: (11) 99999-9999_');
});
exports.indicacaoPhoneFlow = (0, bot_1.addKeyword)(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '('])
    .addAction(async (ctx, { flowDynamic, state, provider }) => {
    const awaitingPhone = await state.get('awaitingReferralPhone');
    if (!awaitingPhone)
        return;
    const phone = (0, referralManager_1.extractPhoneNumber)(ctx.body);
    if (!phone) {
        await flowDynamic('Não consegui identificar o número. Manda de novo.');
        return;
    }
    const context = await state.get('referralContext');
    await state.update({ awaitingReferralPhone: false });
    try {
        const message = await (0, referralManager_1.createReferral)({
            referrerPhone: ctx.from,
            referredPhone: phone,
            context
        });
        await provider.sendMessage(phone, message, {});
        await flowDynamic([
            '*Mensagem enviada!*',
            '',
            'Acabei de mandar uma abordagem inicial.',
            'Te aviso quando ele responder.'
        ]);
    }
    catch {
        await flowDynamic('Não consegui enviar agora, mas vou tentar novamente.');
    }
});
//# sourceMappingURL=indicacaoFlow.js.map