export interface Question {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: 'facil' | 'medio' | 'dificil';
    points: number;
}
export declare const questions: Question[];
export declare function getRandomQuestion(excludeIds?: string[]): Question | null;
//# sourceMappingURL=questions.d.ts.map