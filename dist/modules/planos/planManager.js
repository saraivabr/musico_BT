"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPlan = startPlan;
exports.getNextDay = getNextDay;
exports.listPlans = listPlans;
const database_1 = require("../../services/database");
const plans_1 = require("./plans");
async function startPlan(phone, planId) {
    const plan = (0, plans_1.getPlan)(planId);
    if (!plan)
        throw new Error('Plano não encontrado');
    await (0, database_1.updateUser)(phone, {
        currentPlan: { planId, day: 1, startedAt: new Date() }
    });
    const dayContent = plan.days[0];
    return [
        `*Plano Iniciado: ${plan.name}*`,
        '',
        `Dia 1 de ${plan.duration}`,
        `*${dayContent.title}*`,
        `Leitura: ${dayContent.reading}`,
        '',
        'Leia com calma e depois me conta o que entendeu!'
    ].join('\n');
}
async function getNextDay(phone) {
    const user = await database_1.User.findOne({ phone });
    if (!user?.currentPlan)
        return null;
    const { planId, day } = user.currentPlan;
    const plan = (0, plans_1.getPlan)(planId);
    if (!plan)
        return null;
    const nextDay = day + 1;
    if (nextDay > plan.duration) {
        await (0, database_1.updateUser)(phone, { currentPlan: undefined });
        return `*PARABÉNS!*\n\nVocê completou "${plan.name}"!\n\nDigite "planos" para ver mais opções.`;
    }
    await (0, database_1.updateUser)(phone, { currentPlan: { ...user.currentPlan, day: nextDay } });
    const dayContent = (0, plans_1.getPlanDay)(planId, nextDay);
    return [
        `*Dia ${nextDay} de ${plan.duration}*`,
        `*${dayContent?.title}*`,
        `Leitura: ${dayContent?.reading}`,
        '',
        'Bons estudos!'
    ].join('\n');
}
function listPlans() {
    return [
        '*Planos de Leitura*',
        '',
        ...plans_1.plans.map((p, i) => `${i + 1}. *${p.name}* (${p.duration} dias)\n   _${p.description}_`),
        '',
        'Digite o número para começar!'
    ].join('\n');
}
//# sourceMappingURL=planManager.js.map