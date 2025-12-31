export interface IConversation {
    phone: string;
    timestamp: Date;
    role: 'user' | 'assistant';
    content: string;
    intent?: string;
    emotion?: string;
}
export interface IConversationSummary {
    phone: string;
    summary: string;
    updatedAt: Date;
    keyTopics: string[];
}
//# sourceMappingURL=conversation.d.ts.map