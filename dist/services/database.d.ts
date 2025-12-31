import mongoose from 'mongoose';
import type { IUser } from '../types/user';
import type { IConversation, IConversationSummary } from '../types/conversation';
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export declare const Conversation: mongoose.Model<IConversation, {}, {}, {}, mongoose.Document<unknown, {}, IConversation, {}, {}> & IConversation & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export declare const ConversationSummary: mongoose.Model<IConversationSummary, {}, {}, {}, mongoose.Document<unknown, {}, IConversationSummary, {}, {}> & IConversationSummary & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export declare function connectDB(): Promise<void>;
export declare function getOrCreateUser(phone: string): Promise<IUser>;
export declare function updateUser(phone: string, data: Partial<IUser>): Promise<IUser | null>;
export declare function saveConversation(phone: string, role: 'user' | 'assistant', content: string, intent?: string, emotion?: string): Promise<void>;
export declare function getRecentConversations(phone: string, limit?: number): Promise<IConversation[]>;
//# sourceMappingURL=database.d.ts.map