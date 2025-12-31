"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evangelismoResponseFlow = exports.evangelismoFlow = void 0;
const bot_1 = require("@builderbot/bot");
const journey_1 = require("../modules/evangelismo/journey");
const database_1 = require("../services/database");
exports.evangelismoFlow = (0, bot_1.addKeyword)(['conhecer jesus', 'aceitar jesus', 'quem é jesus', 'vida eterna'])
    .addAction(async (ctx, { flowDynamic, state }) => {
    const step = journey_1.evangelismSteps[0];
    await state.update({ evangelismStep: step.id });
    await flowDynamic(step.message);
});
exports.evangelismoResponseFlow = (0, bot_1.addKeyword)(['sim', 'quero', 'continua', 'orei'])
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    const currentStepId = await state.get('evangelismStep');
    if (!currentStepId)
        return;
    const nextStepId = (0, journey_1.getNextStep)(currentStepId);
    if (!nextStepId) {
        await (0, database_1.updateUser)(ctx.from, { spiritualLevel: 'iniciante' });
        await state.update({ evangelismStep: null });
        await flowDynamic('Vamos começar sua jornada! Digite "planos" para ver os planos de leitura.');
        return;
    }
    const message = (0, journey_1.getStepMessage)(nextStepId);
    if (message) {
        await state.update({ evangelismStep: nextStepId });
        await flowDynamic(message);
    }
});
//# sourceMappingURL=evangelismoFlow.js.map