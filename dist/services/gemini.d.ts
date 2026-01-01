export interface LyricsResponse {
    lyrics: string;
    style: string;
}
export interface EnhanceResponse {
    enhancedLyrics: string;
    changes: string;
}
/**
 * Gera letras de música com base na descrição e estilo fornecidos
 * @param description - Tema, humor, propósito da música
 * @param style - Estilo musical (pop, rock, sertanejo, MPB, etc.)
 * @returns Letra completa com versos, refrão e ponte
 */
export declare function generateLyrics(description: string, style: string): Promise<string>;
/**
 * Melhora/aprimora letras fornecidas pelo usuário
 * @param lyrics - Letra original do usuário
 * @param style - Estilo musical desejado
 * @returns Letra aprimorada com explicação das mudanças
 */
export declare function enhanceLyrics(lyrics: string, style: string): Promise<string>;
/**
 * Gera sugestões de temas para músicas baseado em um contexto
 * @param context - Contexto ou inspiração para sugestões
 * @returns Lista de sugestões de temas
 */
export declare function suggestThemes(context: string): Promise<string[]>;
/**
 * Analisa uma letra e fornece feedback construtivo
 * @param lyrics - Letra para análise
 * @returns Feedback detalhado sobre a letra
 */
export declare function analyzeLyrics(lyrics: string): Promise<string>;
//# sourceMappingURL=gemini.d.ts.map