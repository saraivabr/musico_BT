import { type PlaybookChunk } from '../knowledge/vdiPlaybook';
export declare function getRelevantChunks(query: string, topK?: number): Promise<PlaybookChunk[]>;
export declare function getChunksByCategory(category: string, topK?: number): Promise<PlaybookChunk[]>;
export declare function getChunkById(id: string): Promise<PlaybookChunk | null>;
//# sourceMappingURL=knowledgeBase.d.ts.map