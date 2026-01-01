export interface PlaybookChunk {
    id: string;
    title: string;
    content: string;
    category: 'identidade' | 'produto' | 'qualificacao' | 'objecoes' | 'scripts' | 'followup' | 'fechamento' | 'comportamento';
}
export declare const vdiPlaybook: PlaybookChunk[];
export declare function getChunksByCategory(category: PlaybookChunk['category']): PlaybookChunk[];
export declare function getChunkById(id: string): PlaybookChunk | undefined;
export declare const categories: readonly ["identidade", "produto", "qualificacao", "objecoes", "scripts", "followup", "fechamento", "comportamento"];
//# sourceMappingURL=vdiPlaybook.d.ts.map