"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDevocionalScheduler = startDevocionalScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = require("../../services/database");
const gemini_1 = require("../../services/gemini");
function startDevocionalScheduler(sendMessage) {
    node_cron_1.default.schedule('0 6 * * *', async () => {
        console.log('[Scheduler] Enviando pílula Acelera>AI diária...');
        try {
            const { headline, insight, nextStep } = await (0, gemini_1.generateDevocional)();
            const users = await database_1.User.find({ 'preferences.devocionalEnabled': true });
            const message = [
                'Bom dia! Aqui vai sua pílula Acelera>AI:',
                '',
                `*${headline}*`,
                '',
                insight,
                '',
                `Próximo passo: ${nextStep}`,
                '',
                'Qual melhor horário de 15min hoje ou amanhã pra alinharmos?'
            ].join('\n');
            for (const user of users) {
                try {
                    await sendMessage(user.phone, message);
                }
                catch (err) {
                    console.error(`[Scheduler] Erro ao enviar para ${user.phone}:`, err);
                }
            }
        }
        catch (error) {
            console.error('[Scheduler] Erro no devocional:', error);
        }
    });
    console.log('[Scheduler] Pílula diária configurada (06:00)');
}
//# sourceMappingURL=scheduler.js.map