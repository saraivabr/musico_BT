import type { PlaybookChunk } from './vdiPlaybook';
export interface EmbedInput {
    id: string;
    text: string;
}
export declare function buildEmbeddingInputs(chunks: PlaybookChunk[]): EmbedInput[];
//# sourceMappingURL=embedding.d.ts.map