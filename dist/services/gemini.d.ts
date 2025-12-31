import type { IUser } from '../types/user';
import type { IConversation } from '../types/conversation';
export interface GeminiResponse {
    text: string;
    detectedEmotion?: string;
}
export declare function generateResponse(userMessage: string, user: IUser, conversationHistory: IConversation[], additionalContext?: string): Promise<GeminiResponse>;
export declare function generateDevocional(): Promise<{
    versiculo: string;
    reflexao: string;
}>;
export declare function generatePrayer(request: string, userName?: string): Promise<string>;
//# sourceMappingURL=gemini.d.ts.map