"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEmbeddingInputs = buildEmbeddingInputs;
// Converte o playbook em chunks prontos para gerar embeddings
function buildEmbeddingInputs(chunks) {
    return chunks.map(chunk => ({
        id: chunk.id,
        text: `${chunk.title}\n${chunk.content}`
    }));
}
//# sourceMappingURL=embedding.js.map