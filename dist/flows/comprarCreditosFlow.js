"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarPagamentoFlow = exports.selecionarPacoteFlow = exports.comprarCreditosFlow = void 0;
const bot_1 = require("@builderbot/bot");
const uuid_1 = require("uuid");
const database_1 = require("../services/database");
const wooviPix_1 = require("../services/wooviPix");
// Flow para selecionar pacote
exports.comprarCreditosFlow = (0, bot_1.addKeyword)(['comprar', 'creditos', 'créditos', 'pix', '3'])
    .addAction(async (ctx, { flowDynamic, state }) => {
    const phone = ctx.from;
    const user = await (0, database_1.getOrCreateUser)(phone);
    const credits = user.credits;
    await flowDynamic([
        `💰 *Comprar Créditos*\n\nVocê tem *${credits}* crédito${credits !== 1 ? 's' : ''} disponível${credits !== 1 ? 'is' : ''}.\n\nEscolha um pacote:`,
        `1️⃣ *1 crédito* - R$ 9,99\n_1 música_`,
        `2️⃣ *5 créditos* - R$ 39,99\n_5 músicas (20% off!)_`,
        `3️⃣ *10 créditos* - R$ 69,99\n_10 músicas (30% off!)_`,
        `\nDigite *1*, *2* ou *3* para escolher.\nDigite *menu* para voltar.`
    ]);
    await state.update({ awaitingPackageSelection: true });
});
// Flow para processar seleção e gerar PIX
exports.selecionarPacoteFlow = (0, bot_1.addKeyword)(bot_1.EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, endFlow }) => {
    const currentState = await state.getMyState();
    if (!currentState?.awaitingPackageSelection) {
        return;
    }
    const choice = ctx.body.trim();
    let packageId = null;
    if (choice === '1')
        packageId = 'pack1';
    else if (choice === '2')
        packageId = 'pack5';
    else if (choice === '3')
        packageId = 'pack10';
    if (!packageId) {
        await flowDynamic('❌ Opção inválida. Digite *1*, *2* ou *3*.');
        return;
    }
    await state.update({ awaitingPackageSelection: false });
    const pack = (0, wooviPix_1.getPackageById)(packageId);
    const phone = ctx.from;
    const correlationId = (0, uuid_1.v4)();
    await flowDynamic(`⏳ Gerando PIX para *${pack.credits} crédito${pack.credits > 1 ? 's' : ''}*...`);
    try {
        // Criar cobrança no Woovi
        const charge = await (0, wooviPix_1.createCharge)(pack.price, `Saraiva Music - ${pack.credits} crédito${pack.credits > 1 ? 's' : ''}`, correlationId);
        // Salvar compra pendente no banco
        const purchase = {
            id: correlationId,
            amount: pack.price,
            credits: pack.credits,
            status: 'pending',
            pixCode: charge.pixCode,
            chargeId: charge.chargeId,
            createdAt: new Date(),
            expiresAt: charge.expiresAt
        };
        await (0, database_1.addPurchase)(phone, purchase);
        // Enviar QR Code e instruções
        await flowDynamic([
            `✅ *PIX Gerado!*\n\n💰 Valor: *${(0, wooviPix_1.formatCurrency)(pack.price)}*\n🎫 Créditos: *${pack.credits}*`,
            `📱 *Escaneie o QR Code ou copie o código:*`,
            // O QR code seria enviado como imagem
            `\`\`\`${charge.pixCode}\`\`\``,
            `⏰ *Válido por 30 minutos*\n\n✨ Após o pagamento, você receberá uma confirmação automática e seus créditos serão liberados!`,
            `🔗 Ou pague pelo link:\n${charge.paymentLink}`
        ]);
    }
    catch (error) {
        console.error('[COMPRAR] Erro ao criar cobrança:', error);
        await flowDynamic('❌ Erro ao gerar PIX. Tente novamente em alguns instantes.');
    }
    return endFlow();
});
// Flow para verificar status de pagamento manualmente
exports.verificarPagamentoFlow = (0, bot_1.addKeyword)(['verificar', 'paguei', 'pago'])
    .addAction(async (ctx, { flowDynamic }) => {
    const phone = ctx.from;
    const credits = await (0, database_1.getCredits)(phone);
    await flowDynamic([
        `🔍 *Verificando pagamento...*\n\nSeus créditos atuais: *${credits}*\n\n💡 _Os créditos são liberados automaticamente assim que o PIX for confirmado. Isso geralmente leva alguns segundos._`
    ]);
});
//# sourceMappingURL=comprarCreditosFlow.js.map