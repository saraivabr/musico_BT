"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBible = searchBible;
exports.explainVerse = explainVerse;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../../config");
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.gemini.apiKey);
async function searchBible(query) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Você é especialista em vendas com o método Acelera>AI e atua na Saraiva.AI. Contexto: "${query}".

Responda com:
1. Um playbook curto (3 passos) no WhatsApp.
2. 2 copys exemplo (gancho + CTA) e 1 resposta de objeção provável.
3. Próximo passo sugerido (agendar 15 minutos; ofereça 2 horários).

Formato em markdown, conciso e direto.`;
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
    catch {
        return 'Não consegui buscar agora. Tenta de novo?';
    }
}
async function explainVerse(verse) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Explique a copy ou playbook "${verse}" de forma simples:
1. Intenção (gancho, tensão, prova, oferta ou CTA)
2. Quando usar
3. Ajustes para nichos diferentes
4. CTA sugerido para agendar 15 minutos (ofereça 2 horários)

Máximo 3 parágrafos, tom consultivo.`;
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
    catch {
        return 'Não consegui explicar agora. Tenta de novo?';
    }
}
//# sourceMappingURL=bibleSearch.js.map