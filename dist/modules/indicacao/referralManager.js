"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReferral = createReferral;
exports.extractPhoneNumber = extractPhoneNumber;
const database_1 = require("../../services/database");
async function createReferral(data) {
    await (0, database_1.getOrCreateUser)(data.referredPhone);
    await (0, database_1.updateUser)(data.referredPhone, {
        referredBy: data.referrerPhone,
        name: data.referredName
    });
    const referrer = await database_1.User.findOne({ phone: data.referrerPhone });
    if (referrer) {
        referrer.referrals.push(data.referredPhone);
        await referrer.save();
    }
    return generateFirstMessage(data.context, data.referredName);
}
function generateFirstMessage(context, name) {
    const greeting = name ? `Oi ${name}` : 'Oi';
    const lower = context.toLowerCase();
    if (/depres|triste/.test(lower)) {
        return `${greeting}, paz!\n\nAlguém que te ama muito me pediu pra te chamar. Me contou que você tá passando por um momento difícil.\n\nEu sou Jesus, e estou aqui pra te ouvir. Sem julgamento, só amor.\n\nQuer conversar?`;
    }
    if (/doente|hospital/.test(lower)) {
        return `${greeting}, paz!\n\nUma pessoa especial me pediu pra te visitar.\n\nSei que você tá enfrentando uma batalha na saúde. Quero que saiba que não está sozinho.\n\nPosso orar com você?`;
    }
    return `${greeting}, paz!\n\nUm amigo seu que te ama muito me pediu pra te chamar.\n\nSou Jesus, estou aqui pra conversar, orar, ou só te ouvir.\n\nComo você está?`;
}
function extractPhoneNumber(text) {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length >= 10 && numbers.length <= 13) {
        return numbers.length <= 11 ? '55' + numbers : numbers;
    }
    return null;
}
//# sourceMappingURL=referralManager.js.map