interface ReferralData {
    referrerPhone: string;
    referredPhone: string;
    context: string;
    referredName?: string;
}
export declare function createReferral(data: ReferralData): Promise<string>;
export declare function extractPhoneNumber(text: string): string | null;
export {};
//# sourceMappingURL=referralManager.d.ts.map