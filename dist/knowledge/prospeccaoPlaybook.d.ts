export interface ProspeccaoChunk {
    id: string;
    title: string;
    content: string;
    category: 'identidade' | 'primeira_mensagem' | 'personalizacao' | 'followup' | 'qualificacao' | 'objecoes' | 'passagem' | 'comportamento';
}
export declare const prospeccaoPlaybook: ProspeccaoChunk[];
export declare function getProspeccaoByCategory(category: ProspeccaoChunk['category']): ProspeccaoChunk[];
export declare function getProspeccaoById(id: string): ProspeccaoChunk | undefined;
export declare const prospeccaoCategorias: readonly ["identidade", "primeira_mensagem", "personalizacao", "followup", "qualificacao", "objecoes", "passagem", "comportamento"];
//# sourceMappingURL=prospeccaoPlaybook.d.ts.map