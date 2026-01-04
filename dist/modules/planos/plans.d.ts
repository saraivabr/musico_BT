export interface ReadingPlan {
    id: string;
    name: string;
    description: string;
    duration: number;
    days: Array<{
        day: number;
        reading: string;
        title: string;
    }>;
}
export declare const plans: ReadingPlan[];
export declare function getPlan(id: string): ReadingPlan | undefined;
export declare function getPlanDay(planId: string, day: number): {
    day: number;
    reading: string;
    title: string;
} | undefined;
//# sourceMappingURL=plans.d.ts.map