"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelevantChunks = getRelevantChunks;
exports.getChunksByCategory = getChunksByCategory;
exports.getChunkById = getChunkById;
const generative_ai_1 = require("@google/generative-ai");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const vdiPlaybook_1 = require("../knowledge/vdiPlaybook");
const embeddingModelName = 'text-embedding-004';
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.gemini.apiKey);
let knowledgeIndex = null;
const embeddingsFile = path_1.default.join(process.cwd(), 'data', 'vdi-embeddings.json');
async function embed(text) {
    const model = genAI.getGenerativeModel({ model: embeddingModelName });
    const result = await model.embedContent(text);
    return result.embedding.values;
}
function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    if (normA === 0 || normB === 0)
        return 0;
    return dot / (normA * normB);
}
async function loadEmbeddings() {
    if (knowledgeIndex)
        return knowledgeIndex;
    try {
        // Carrega embeddings pré-gerados
        const data = await fs_1.promises.readFile(embeddingsFile, 'utf-8');
        const embeddings = JSON.parse(data);
        if (embeddings?.length) {
            console.log(`[KnowledgeBase] Carregados ${embeddings.length} embeddings do VDI`);
            knowledgeIndex = embeddings;
            return knowledgeIndex;
        }
    }
    catch (error) {
        console.log('[KnowledgeBase] Arquivo de embeddings não encontrado, gerando...');
    }
    // Se não existe, gera em tempo real (fallback)
    const vectors = [];
    for (const chunk of vdiPlaybook_1.vdiPlaybook) {
        try {
            const text = `${chunk.title}\n${chunk.content}`;
            const vector = await embed(text);
            vectors.push({
                id: chunk.id,
                category: chunk.category,
                title: chunk.title,
                content: chunk.content,
                vector
            });
        }
        catch (error) {
            console.error('[KnowledgeBase] Erro ao gerar embedding:', error);
        }
    }
    knowledgeIndex = vectors;
    // Salva pra próxima vez
    try {
        await fs_1.promises.mkdir(path_1.default.dirname(embeddingsFile), { recursive: true });
        await fs_1.promises.writeFile(embeddingsFile, JSON.stringify(vectors, null, 2));
        console.log(`[KnowledgeBase] Embeddings salvos em ${embeddingsFile}`);
    }
    catch (error) {
        console.error('[KnowledgeBase] Falha ao salvar embeddings:', error);
    }
    return knowledgeIndex;
}
async function getRelevantChunks(query, topK = 4) {
    try {
        const index = await loadEmbeddings();
        if (index.length === 0)
            return [];
        const queryVector = await embed(query);
        const scored = index
            .map(item => ({
            score: cosineSimilarity(queryVector, item.vector),
            chunk: {
                id: item.id,
                title: item.title,
                content: item.content,
                category: item.category
            }
        }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
        // Log para debug
        console.log(`[KnowledgeBase] Query: "${query.substring(0, 50)}..."`);
        console.log(`[KnowledgeBase] Top chunks: ${scored.map(s => `${s.chunk.id}(${s.score.toFixed(2)})`).join(', ')}`);
        return scored.map(s => s.chunk);
    }
    catch (error) {
        console.error('[KnowledgeBase] Falha ao buscar chunks:', error);
        return [];
    }
}
// Busca por categoria específica
async function getChunksByCategory(category, topK = 3) {
    const index = await loadEmbeddings();
    return index
        .filter(item => item.category === category)
        .slice(0, topK)
        .map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category
    }));
}
// Busca chunk específico por ID
async function getChunkById(id) {
    const index = await loadEmbeddings();
    const item = index.find(i => i.id === id);
    if (!item)
        return null;
    return {
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category
    };
}
//# sourceMappingURL=knowledgeBase.js.map