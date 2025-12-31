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
        console.log('[Scheduler] Enviando devocional diário...');
        try {
            const { versiculo, reflexao } = await (0, gemini_1.generateDevocional)();
            const users = await database_1.User.find({ 'preferences.devocionalEnabled': true });
            const message = [
                'Bom dia, meu filho!',
                '',
                '*Devocional do Dia*',
                '',
                `_"${versiculo}"_`,
                '',
                reflexao,
                '',
                'Tenha um dia abençoado!'
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
    console.log('[Scheduler] Devocional diário configurado (06:00)');
}
//# sourceMappingURL=scheduler.js.map