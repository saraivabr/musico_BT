import mongoose from 'mongoose';
import type { IUser, IPurchase, IMusic } from '../types/user';
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export declare function connectDB(): Promise<void>;
export declare function getOrCreateUser(phone: string): Promise<IUser>;
export declare function updateUser(phone: string, data: Partial<IUser>): Promise<IUser | null>;
export declare function getUserByPhone(phone: string): Promise<IUser | null>;
export declare function addCredits(phone: string, credits: number): Promise<IUser | null>;
export declare function deductCredit(phone: string): Promise<boolean>;
export declare function getCredits(phone: string): Promise<number>;
export declare function addPurchase(phone: string, purchase: IPurchase): Promise<IUser | null>;
export declare function updatePurchaseStatus(phone: string, purchaseId: string, status: 'pending' | 'paid' | 'expired', paidAt?: Date): Promise<IUser | null>;
export declare function findPurchaseByCorrelationId(correlationId: string): Promise<{
    phone: string;
    purchase: IPurchase;
} | null>;
export declare function confirmPurchaseAndAddCredits(correlationId: string): Promise<{
    phone: string;
    credits: number;
} | null>;
export declare function addMusic(phone: string, music: IMusic): Promise<IUser | null>;
export declare function updateMusicStatus(phone: string, musicId: string, updates: Partial<IMusic>): Promise<IUser | null>;
export declare function getUserMusics(phone: string, limit?: number): Promise<IMusic[]>;
export declare function findMusicByTaskId(taskId: string): Promise<{
    phone: string;
    music: IMusic;
} | null>;
export declare function getUserStats(phone: string): Promise<IUser['stats'] | null>;
//# sourceMappingURL=database.d.ts.map