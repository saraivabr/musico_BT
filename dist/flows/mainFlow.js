"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainFlow = void 0;
const bot_1 = require("@builderbot/bot");
const intentDetector_1 = require("../services/intentDetector");
const gemini_1 = require("../services/gemini");
const database_1 = require("../services/database");
exports.mainFlow = (0, bot_1.addKeyword)(bot_1.EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    const phone = ctx.from;
    const message = ctx.body;
    // Get or create user
    const user = await (0, database_1.getOrCreateUser)(phone);
    // Save user message
    await (0, database_1.saveConversation)(phone, 'user', message);
    // Check crisis first
    if ((0, intentDetector_1.isCrisis)(message)) {
        const crisisResponse = `Meu filho, eu sinto sua dor. Você não está sozinho.

Por favor, ligue agora para o CVV: 188 (24h)
Ou acesse: cvv.org.br

Eu estou aqui com você. Vamos conversar?`;
        await flowDynamic(crisisResponse);
        await (0, database_1.saveConversation)(phone, 'assistant', crisisResponse, 'crise');
        return;
    }
    // Check if awaiting name
    const awaitingName = await state.get('awaitingName');
    if (awaitingName) {
        await (0, database_1.updateUser)(phone, { name: message });
        await state.update({ name: message, awaitingName: false });
        await flowDynamic([
            `${message}, que nome lindo!`,
            'Fico feliz em te conhecer. Como posso te abençoar hoje?',
            '_Digite "menu" para ver as opções ou me conte o que está no seu coração._'
        ]);
        return;
    }
    // Detect intent
    const intent = (0, intentDetector_1.detectIntent)(message);
    // Route by intent
    switch (intent) {
        case 'menu':
        case 'saudacao':
            const userName = user.name || await state.get('name');
            await flowDynamic([
                userName ? `Olá ${userName}!` : 'Paz do Senhor!',
                '',
                'Como posso te ajudar?',
                '1. Devocional',
                '2. Quiz',
                '3. Oração',
                '4. Planos de leitura',
                '5. Buscar na Bíblia',
                '6. Conversar',
                '7. Indicar amigo'
            ]);
            break;
        default:
            // Free conversation with Gemini
            const history = await (0, database_1.getRecentConversations)(phone);
            const response = await (0, gemini_1.generateResponse)(message, user, history);
            await flowDynamic(response.text);
            await (0, database_1.saveConversation)(phone, 'assistant', response.text, intent, response.detectedEmotion);
    }
});
//# sourceMappingURL=mainFlow.js.map