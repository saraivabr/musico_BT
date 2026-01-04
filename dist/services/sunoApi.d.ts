interface SunoTaskStatus {
    code: number;
    msg: string;
    data: {
        status: 'pending' | 'processing' | 'completed' | 'failed';
        songs?: Array<{
            id: string;
            title: string;
            audioUrl: string;
            videoUrl?: string;
            imageUrl?: string;
            duration: number;
            lyrics?: string;
        }>;
        errorMessage?: string;
    };
}
/**
 * Gera música a partir de descrição ou letra
 */
export declare function generateMusic(prompt: string, style: string, isCustomLyrics?: boolean, title?: string): Promise<string>;
/**
 * Gera apenas letra (sem música)
 */
export declare function generateLyrics(theme: string, style: string): Promise<{
    lyrics: string;
    title: string;
}>;
/**
 * Verifica status da geração
 */
export declare function checkTaskStatus(taskId: string): Promise<SunoTaskStatus['data']>;
/**
 * Gera vídeo com letra sincronizada
 */
export declare function generateVideo(songId: string): Promise<string>;
/**
 * Aguarda conclusão da geração (polling)
 */
export declare function waitForCompletion(taskId: string, maxAttempts?: number, // 5 minutos (60 * 5s)
intervalMs?: number): Promise<SunoTaskStatus['data']>;
/**
 * Verifica créditos disponíveis na conta Suno
 */
export declare function getCredits(): Promise<number>;
export {};
//# sourceMappingURL=sunoApi.d.ts.map