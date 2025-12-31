export interface IUser {
    phone: string;
    name?: string;
    createdAt: Date;
    lastInteraction: Date;
    spiritualLevel: 'iniciante' | 'crescendo' | 'maduro';
    currentPlan?: {
        planId: string;
        day: number;
        startedAt: Date;
    };
    quizStats: {
        totalPoints: number;
        gamesPlayed: number;
        correctAnswers: number;
    };
    prayerRequests: Array<{
        id: string;
        request: string;
        createdAt: Date;
        status: 'active' | 'answered';
        followUpSent: boolean;
    }>;
    referredBy?: string;
    referrals: string[];
    preferences: {
        devocionalEnabled: boolean;
        devocionalTime: string;
    };
}
//# sourceMappingURL=user.d.ts.map