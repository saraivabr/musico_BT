"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeUserMessage = analyzeUserMessage;
exports.generateBotResponse = generateBotResponse;
const openai_1 = require("openai");
const config_1 = require("../config");
const openai = new openai_1.OpenAI({ apiKey: config_1.config.openai.apiKey });
/**
 * Analisa mensagem do usuário e mantém contexto da conversa
 */
async function analyzeUserMessage(userMessage, conversationHistory) {
    try {
        const systemPrompt = `Você é um assistente criativo ajudando alguém a criar uma música.

Analise a mensagem do usuário e extraia:
1. **description**: Se o usuário descreveu uma ideia/emoção (ex: "vibe de saudade", "festa alegre")
2. **lyrics**: Se o usuário forneceu letras prontas
3. **style**: Se mencionou estilo (ex: "dança", "acústico", "trap", "melancólico")
4. **hasEnoughInfo**: true se tem descrição OU letra + estilo
5. **nextQuestion**: Pergunta natural para esclarecer o que falta (tipo amigo conversando)
6. **readyToGenerate**: true se pode gerar música agora

Responda APENAS em JSON, sem markdown.
Exemplo:
{"description":"festa de 15 anos alegre","lyrics":null,"style":"dança","hasEnoughInfo":false,"nextQuestion":"Quer algo mais energético ou romântico?","readyToGenerate":false}

Seja conversacional, como um amigo ajudando!`;
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...conversationHistory,
            {
                role: 'user',
                content: userMessage
            }
        ];
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 200
        });
        const content = response.choices[0].message.content;
        if (!content)
            throw new Error('Sem resposta da IA');
        const result = JSON.parse(content);
        return result;
    }
    catch (error) {
        console.error('Erro ao analisar mensagem:', error);
        // Fallback para análise simples se GPT falhar
        return simpleAnalysis(userMessage);
    }
}
/**
 * Análise simples como fallback
 */
function simpleAnalysis(message) {
    const lower = message.toLowerCase();
    // Detectar estilo
    const styles = {
        dança: 'dança',
        dance: 'dança',
        trap: 'trap',
        funk: 'funk',
        acústico: 'acústico',
        acoustic: 'acústico',
        melancólico: 'melancólico',
        triste: 'melancólico',
        sad: 'melancólico',
        romantic: 'romântico',
        romântico: 'romântico',
        energético: 'energético',
        energetic: 'energético',
        pop: 'pop',
        sertanejo: 'sertanejo',
        forró: 'forró',
        samba: 'samba'
    };
    let detectedStyle = undefined;
    for (const [key, value] of Object.entries(styles)) {
        if (lower.includes(key)) {
            detectedStyle = value;
            break;
        }
    }
    // Se tem muita informação, pode gerar
    const hasLotOfInfo = message.length > 100;
    const hasStyle = !!detectedStyle;
    return {
        description: message.length > 10 ? message : undefined,
        style: detectedStyle,
        hasEnoughInfo: hasLotOfInfo && hasStyle,
        nextQuestion: !hasStyle ? '🎵 Qual estilo você imagina? (dança, trap, acústico, melancólico...?)' : undefined,
        readyToGenerate: hasLotOfInfo && hasStyle
    };
}
/**
 * Gera resposta conversacional do bot
 */
async function generateBotResponse(userMessage, context, conversationHistory) {
    try {
        const systemPrompt = `Você é Saraiva, um assistente amigável que ajuda a criar músicas no WhatsApp.
Responda de forma conversacional, como um amigo. Seja breve, natural e use emojis.

Contexto atual:
- Descrição: ${context.description || 'não informada'}
- Estilo: ${context.style || 'não informado'}
- Pronto para gerar: ${context.readyToGenerate ? 'SIM ✨' : 'NÃO'}

Se readyToGenerate=true: responda "Perfeito! Deixa eu criar isso pra você... ✨"
Se falta algo: pergunte conversacionalmente o que falta.
Nunca faça listas numeradas ou etapas.`;
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...conversationHistory,
            {
                role: 'user',
                content: userMessage
            }
        ];
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.8,
            max_tokens: 150
        });
        return response.choices[0].message.content || 'Qual é sua vibe? 🎵';
    }
    catch (error) {
        console.error('Erro ao gerar resposta:', error);
        return context.nextQuestion || 'Me conta mais sobre sua música! 🎤';
    }
}
//# sourceMappingURL=conversationAnalysis.js.map