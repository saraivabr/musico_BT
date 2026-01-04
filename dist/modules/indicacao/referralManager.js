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
    if (/urgente|prazo|lançamento|lançamento/.test(lower)) {
        return `${greeting}! Recebi seu contato via Saraiva.AI.\n\nSou especialista em Acelera>AI (copy matricial que converte no WhatsApp). Vi que você está em ritmo de lançamento/prazo apertado.\n\nPosso te mandar 3 ajustes rápidos agora para aumentar resposta e agenda? Se fizer sentido, marcamos 15min hoje 14:30 ou amanhã 9:00.`;
    }
    if (/lead|venda|cliente|pipeline/.test(lower)) {
        return `${greeting}! Um parceiro me pediu para falar com você via Saraiva.AI.\n\nTrabalho com o método Acelera>AI para destravar leads e fechar mais rápido.\n\nMe conta seu nicho e tipo de oferta que eu já te devolvo 2 abordagens prontas e agendamos 15min (hoje 14:30 ou amanhã 9:00).`;
    }
    return `${greeting}! Cheguei por indicação via Saraiva.AI. Atuo com Acelera>AI, montando copys e playbooks que fazem o lead avançar.\n\nQual é sua oferta principal e o resultado que você quer em 30 dias? Posso te mostrar em 15min (hoje 14:30 ou amanhã 9:00).`;
}
function extractPhoneNumber(text) {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length >= 10 && numbers.length <= 13) {
        return numbers.length <= 11 ? '55' + numbers : numbers;
    }
    return null;
}
//# sourceMappingURL=referralManager.js.map