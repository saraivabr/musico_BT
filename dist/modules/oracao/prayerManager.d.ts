export declare function addPrayerRequest(phone: string, request: string): Promise<string>;
export declare function getPrayerRequests(phone: string): Promise<{
    id: string;
    request: string;
    createdAt: Date;
}[]>;
export declare function markPrayerAnswered(phone: string, prayerId: string): Promise<void>;
//# sourceMappingURL=prayerManager.d.ts.map