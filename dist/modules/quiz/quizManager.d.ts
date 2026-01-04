import { Question } from './questions';
export declare function formatQuestion(question: Question): string;
export declare function startQuiz(phone: string): Promise<string>;
export declare function checkAnswer(phone: string, answer: string): Promise<{
    correct: boolean;
    explanation: string;
    points: number;
    totalPoints: number;
    nextQuestion?: string;
    finished: boolean;
}>;
export declare function hasActiveQuiz(phone: string): boolean;
export declare function endQuiz(phone: string): number;
//# sourceMappingURL=quizManager.d.ts.map