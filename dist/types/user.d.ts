export interface IPurchase {
    id: string;
    amount: number;
    credits: number;
    status: 'pending' | 'paid' | 'expired';
    pixCode: string;
    pixQrCodeBase64?: string;
    chargeId: string;
    createdAt: Date;
    paidAt?: Date;
    expiresAt: Date;
}
export interface IMusic {
    id: string;
    prompt: string;
    style: string;
    isCustomLyrics: boolean;
    generatedLyrics?: string;
    status: 'generating' | 'ready' | 'failed';
    sunoTaskId: string;
    audioUrl?: string;
    videoUrl?: string;
    downloadUrl?: string;
    title?: string;
    createdAt: Date;
    completedAt?: Date;
    errorMessage?: string;
}
export interface IUser {
    phone: string;
    name?: string;
    createdAt: Date;
    lastInteraction: Date;
    credits: number;
    purchases: IPurchase[];
    musics: IMusic[];
    stats: {
        totalMusicsCreated: number;
        totalCreditsSpent: number;
        totalAmountPaid: number;
    };
}
export declare const MUSIC_STYLES: readonly [{
    readonly id: "pop";
    readonly name: "Pop";
    readonly emoji: "🎤";
}, {
    readonly id: "sertanejo";
    readonly name: "Sertanejo";
    readonly emoji: "🤠";
}, {
    readonly id: "funk";
    readonly name: "Funk";
    readonly emoji: "🔊";
}, {
    readonly id: "rock";
    readonly name: "Rock";
    readonly emoji: "🎸";
}, {
    readonly id: "gospel";
    readonly name: "Gospel";
    readonly emoji: "🙏";
}, {
    readonly id: "rap";
    readonly name: "Rap/Hip-Hop";
    readonly emoji: "🎤";
}, {
    readonly id: "mpb";
    readonly name: "MPB";
    readonly emoji: "🇧🇷";
}, {
    readonly id: "forro";
    readonly name: "Forró";
    readonly emoji: "🪗";
}, {
    readonly id: "eletronica";
    readonly name: "Eletrônica";
    readonly emoji: "🎧";
}, {
    readonly id: "reggae";
    readonly name: "Reggae";
    readonly emoji: "🟢";
}, {
    readonly id: "romantico";
    readonly name: "Romântico";
    readonly emoji: "💕";
}, {
    readonly id: "infantil";
    readonly name: "Infantil";
    readonly emoji: "👶";
}];
export type MusicStyleId = typeof MUSIC_STYLES[number]['id'];
export declare const CREDIT_PACKS: readonly [{
    readonly id: "pack1";
    readonly credits: 1;
    readonly price: 999;
    readonly description: "1 crédito";
}, {
    readonly id: "pack5";
    readonly credits: 5;
    readonly price: 3999;
    readonly description: "5 créditos (20% off)";
}, {
    readonly id: "pack10";
    readonly credits: 10;
    readonly price: 6999;
    readonly description: "10 créditos (30% off)";
}];
export type CreditPackId = typeof CREDIT_PACKS[number]['id'];
//# sourceMappingURL=user.d.ts.map