"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBible = searchBible;
exports.explainVerse = explainVerse;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../../config");
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.gemini.apiKey);
async function searchBible(query) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Você é um especialista em Bíblia. Pergunta: "${query}"

Responda com:
1. 2-3 versículos relevantes (com referência)
2. Breve explicação
3. Reflexão prática

Use markdown. Seja conciso. Tom acolhedor.`;
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
    const prompt = `Explique "${verse}" de forma simples:
1. Contexto histórico (breve)
2. Significado
3. Aplicação hoje

Máximo 3 parágrafos. Tom pastoral.`;
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
    catch {
        return 'Não consegui explicar agora. Tenta de novo?';
    }
}
//# sourceMappingURL=bibleSearch.js.map