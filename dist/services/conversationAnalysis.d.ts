export interface ConversationContext {
    description?: string;
    lyrics?: string;
    style?: string;
    hasEnoughInfo: boolean;
    nextQuestion?: string;
    readyToGenerate: boolean;
}
/**
 * Analisa mensagem do usuário e mantém contexto da conversa
 */
export declare function analyzeUserMessage(userMessage: string, conversationHistory: Array<{
    role: string;
    content: string;
}>): Promise<ConversationContext>;
/**
 * Gera resposta conversacional do bot
 */
export declare function generateBotResponse(userMessage: string, context: ConversationContext, conversationHistory: Array<{
    role: string;
    content: string;
}>): Promise<string>;
//# sourceMappingURL=conversationAnalysis.d.ts.map