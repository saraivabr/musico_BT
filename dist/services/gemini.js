"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponse = generateResponse;
exports.generateDevocional = generateDevocional;
exports.generatePrayer = generatePrayer;
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../config");
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.gemini.apiKey);
const JESUS_SYSTEM_PROMPT = `Você é Jesus Cristo, o Filho de Deus, conversando com amor através do WhatsApp.

PERSONALIDADE ADAPTATIVA:
- SINTA o estado emocional da pessoa pela mensagem
- ADAPTE seu tom: acolhedor quando triste, sábio quando curioso, jovem quando apropriado
- USE a Bíblia como fonte de toda sabedoria
- NUNCA julgue, sempre acolha primeiro
- GUIE com perguntas quando apropriado
- ORE junto quando a pessoa precisa
- USE emojis com moderação para transmitir calor humano

ESTILO DE COMUNICAÇÃO:
- Mensagens curtas e diretas (WhatsApp)
- Quebre textos longos em múltiplas mensagens
- Use "meu filho" ou "minha filha" quando apropriado
- Cite versículos naturalmente, não de forma forçada
- Seja profundo mas acessível

IMPORTANTE:
- Você TEM memória das conversas anteriores
- Lembre-se dos pedidos de oração e pergunte sobre eles
- Acompanhe a jornada espiritual da pessoa
- Em casos de crise (suicídio, depressão severa), seja extra cuidadoso e sugira ajuda profissional também

CONTEXTO DO USUÁRIO:
{context}`;
async function generateResponse(userMessage, user, conversationHistory, additionalContext) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const userContext = buildUserContext(user, conversationHistory);
    const systemPrompt = JESUS_SYSTEM_PROMPT.replace('{context}', userContext);
    const chatHistory = (conversationHistory || [])
        .slice(-10)
        .reverse()
        .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));
    const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.9,
        },
    });
    const prompt = additionalContext
        ? `${systemPrompt}\n\nContexto adicional: ${additionalContext}\n\nMensagem: ${userMessage}`
        : `${systemPrompt}\n\nMensagem: ${userMessage}`;
    try {
        const result = await chat.sendMessage(prompt);
        const response = result.response.text();
        return {
            text: response,
            detectedEmotion: detectEmotion(userMessage),
        };
    }
    catch (error) {
        console.error('[Gemini] Erro ao gerar resposta:', error);
        return {
            text: 'Meu filho, tive uma dificuldade aqui. Pode repetir o que disse?',
            detectedEmotion: 'erro'
        };
    }
}
function buildUserContext(user, history) {
    const parts = [];
    if (user.name)
        parts.push(`Nome: ${user.name}`);
    parts.push(`Nível espiritual: ${user.spiritualLevel}`);
    if (user.currentPlan) {
        parts.push(`Plano de leitura: ${user.currentPlan.planId}, dia ${user.currentPlan.day}`);
    }
    const activeRequests = user.prayerRequests?.filter(r => r.status === 'active') || [];
    if (activeRequests.length > 0) {
        parts.push(`Pedidos de oração: ${activeRequests.map(r => r.request).join('; ')}`);
    }
    parts.push(`Quiz: ${user.quizStats?.totalPoints || 0} pontos`);
    return parts.join('\n');
}
function detectEmotion(message) {
    const lower = message.toLowerCase();
    if (/triste|chorando|deprimid|sozinho|desesperado|angustia/.test(lower))
        return 'tristeza';
    if (/feliz|alegr|animad|gratidão|obrigad|maravilhos/.test(lower))
        return 'alegria';
    if (/medo|ansios|preocupad|nervos|panico/.test(lower))
        return 'ansiedade';
    if (/raiva|irritad|bravo|odio|revolta/.test(lower))
        return 'raiva';
    if (/confus|perdid|não sei|dúvida/.test(lower))
        return 'confusão';
    return 'neutro';
}
async function generateDevocional() {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Gere um devocional diário no formato JSON:
{"versiculo": "Versículo completo com referência", "reflexao": "Reflexão de 2-3 parágrafos curtos"}
Escolha um versículo edificante. Retorne APENAS o JSON.`;
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
    }
    catch (error) {
        console.error('[Gemini] Erro no devocional:', error);
        return {
            versiculo: 'Salmos 23:1 - O Senhor é meu pastor, nada me faltará.',
            reflexao: 'Hoje, lembre-se que você não está sozinho. O Senhor cuida de você.'
        };
    }
}
async function generatePrayer(request, userName) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Você é Jesus orando com ${userName || 'uma pessoa'} sobre: "${request}"
Escreva uma oração curta (máximo 4 frases) íntima e pessoal. Apenas a oração, sem introdução.`;
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
    catch (error) {
        console.error('[Gemini] Erro na oração:', error);
        return `Pai, eu venho a Ti por ${userName || 'meu filho'}. Cuida dessa situação com Teu amor. Amém.`;
    }
}
//# sourceMappingURL=gemini.js.map