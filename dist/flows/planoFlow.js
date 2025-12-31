"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planoProximoFlow = exports.planoSelectFlow = exports.planoFlow = void 0;
const bot_1 = require("@builderbot/bot");
const planManager_1 = require("../modules/planos/planManager");
const plans_1 = require("../modules/planos/plans");
exports.planoFlow = (0, bot_1.addKeyword)(['plano', 'planos', 'leitura', '4'])
    .addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic((0, planManager_1.listPlans)());
});
exports.planoSelectFlow = (0, bot_1.addKeyword)(['1', '2'])
    .addAction(async (ctx, { flowDynamic, state }) => {
    const inQuiz = await state.get('inQuiz');
    if (inQuiz)
        return; // Don't interfere with quiz
    const selection = parseInt(ctx.body) - 1;
    if (selection >= 0 && selection < plans_1.plans.length) {
        const message = await (0, planManager_1.startPlan)(ctx.from, plans_1.plans[selection].id);
        await flowDynamic(message);
    }
});
exports.planoProximoFlow = (0, bot_1.addKeyword)(['próximo', 'proximo', 'terminei', 'li'])
    .addAction(async (ctx, { flowDynamic }) => {
    const message = await (0, planManager_1.getNextDay)(ctx.from);
    if (message) {
        await flowDynamic(message);
    }
    else {
        await flowDynamic('Você não está em um plano. Digite "planos" para começar!');
    }
});
//# sourceMappingURL=planoFlow.js.map