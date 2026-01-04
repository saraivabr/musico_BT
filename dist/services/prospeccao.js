"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarPrimeiraMensagem = gerarPrimeiraMensagem;
exports.gerarFollowUp = gerarFollowUp;
exports.responderProspeccao = responderProspeccao;
exports.calcularProximoFollowUp = calcularProximoFollowUp;
exports.deveEnviarFollowUp = deveEnviarFollowUp;
const generative_ai_1 = require("@google/generative-ai");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const genAI = new generative_ai_1.GoogleGenerativeAI(config_1.config.gemini.apiKey);
const embeddingModel = 'text-embedding-004';
// ============================================================
// CACHE DE EMBEDDINGS
// ============================================================
let prospeccaoIndex = null;
const embeddingsFile = path_1.default.join(process.cwd(), 'data', 'prospeccao-embeddings.json');
async function loadProspeccaoEmbeddings() {
    if (prospeccaoIndex)
        return prospeccaoIndex;
    try {
        const data = await fs_1.promises.readFile(embeddingsFile, 'utf-8');
        const embeddings = JSON.parse(data);
        if (embeddings?.length) {
            console.log(`[Prospecção] Carregados ${embeddings.length} embeddings`);
            prospeccaoIndex = embeddings;
            return prospeccaoIndex;
        }
    }
    catch {
        console.log('[Prospecção] Embeddings não encontrados');
    }
    return [];
}
async function embed(text) {
    const model = genAI.getGenerativeModel({ model: embeddingModel });
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
async function getRelevantProspeccaoChunks(query, topK = 4) {
    const index = await loadProspeccaoEmbeddings();
    if (index.length === 0)
        return [];
    const queryVector = await embed(query);
    return index
        .map(item => ({ score: cosineSimilarity(queryVector, item.vector), item }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(s => s.item);
}
// ============================================================
// PROMPTS DE PROSPECÇÃO
// ============================================================
const PROSPECCAO_SYSTEM_PROMPT = `Você é uma prospectadora experiente (BDR). Seu trabalho é abrir portas, não vender.

QUEM VOCÊ É:
- Prospectadora humana, curiosa, não invasiva
- Fala como gente: "vc", "pra", "tá", "né"
- Nunca parece robô ou spam
- Sempre personaliza com algo específico do negócio

OBJETIVO:
- Gerar uma resposta (qualquer resposta é melhor que silêncio)
- Não vender na primeira mensagem
- Fazer o lead pensar "opa, isso pode ser interessante"

REGRAS:
- Primeira mensagem: máximo 3 linhas
- Sempre termina com pergunta fácil de responder
- Nunca manda textão
- Nunca começa com "Olá, tudo bem?"
- Sempre menciona algo específico do negócio (nome, avaliação, localização)
- Nunca fala preço
- Nunca manda link/PDF de cara

ESTRUTURA DA PRIMEIRA MENSAGEM:
1. Gancho personalizado (mostra que pesquisou)
2. Dor/oportunidade em 1 frase
3. Pergunta que gera resposta

FOLLOW-UP:
- Follow-up 1 (2 dias): curto, pergunta se é a pessoa certa
- Follow-up 2 (4 dias): traz valor ou prova social
- Follow-up 3 (7 dias): despedida (última tentativa)

{knowledge}

CONTEXTO DO LEAD:
{context}`;
// ============================================================
// FUNÇÕES PRINCIPAIS
// ============================================================
async function gerarPrimeiraMensagem(lead) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    // Busca conhecimento relevante
    const query = `primeira mensagem prospecção ${lead.category} abordagem cold outreach`;
    const chunks = await getRelevantProspeccaoChunks(query, 3);
    const knowledge = chunks.map(c => `- ${c.title}: ${c.content}`).join('\n');
    // Monta contexto do lead
    const context = buildLeadContext(lead);
    const prompt = PROSPECCAO_SYSTEM_PROMPT
        .replace('{knowledge}', knowledge)
        .replace('{context}', context);
    const instruction = `Gere a PRIMEIRA MENSAGEM de prospecção para este lead.

Dados do lead:
- Nome do negócio: ${lead.businessName}
- Categoria: ${lead.category}
- Avaliação: ${lead.rating || 'não informada'} (${lead.reviewCount || 0} avaliações)
- Endereço: ${lead.address || 'não informado'}

Gere UMA mensagem curta (máximo 3 linhas) que:
1. Mencione algo específico do negócio
2. Toque em uma dor comum do segmento
3. Termine com pergunta fácil

Retorne APENAS a mensagem, sem explicações.`;
    try {
        const result = await model.generateContent(`${prompt}\n\n${instruction}`);
        return result.response.text().trim();
    }
    catch (error) {
        console.error('[Prospecção] Erro ao gerar mensagem:', error);
        return gerarMensagemFallback(lead);
    }
}
async function gerarFollowUp(lead, followupNumber) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const query = `follow-up ${followupNumber} prospecção insistir`;
    const chunks = await getRelevantProspeccaoChunks(query, 2);
    const knowledge = chunks.map(c => `- ${c.title}: ${c.content}`).join('\n');
    const context = buildLeadContext(lead);
    const prompt = PROSPECCAO_SYSTEM_PROMPT
        .replace('{knowledge}', knowledge)
        .replace('{context}', context);
    let instruction = '';
    switch (followupNumber) {
        case 1:
            instruction = `Gere o PRIMEIRO FOLLOW-UP (2 dias depois da primeira mensagem).

Deve ser curto e leve. Pergunte se é a pessoa certa.
Exemplo: "oi! mandei uma msg dias atrás, não sei se viu. só queria trocar uma ideia rápida sobre [tema]. faz sentido ou tô falando com a pessoa errada?"

Retorne APENAS a mensagem.`;
            break;
        case 2:
            instruction = `Gere o SEGUNDO FOLLOW-UP (4 dias depois).

Traga valor ou prova social. Não repita o que já disse.
Exemplo: "oi de novo! vi um caso essa semana de uma [mesmo nicho] que tava perdendo cliente no zap e conseguiu reverter isso. se tiver 2min te conto como."

Retorne APENAS a mensagem.`;
            break;
        case 3:
        default:
            instruction = `Gere o TERCEIRO E ÚLTIMO FOLLOW-UP (despedida).

Tom de despedida, sem pressão. Deixa porta aberta.
Exemplo: "oi! última tentativa aqui rs. se não fizer sentido, sem stress, vou parar de incomodar. mas se quiser trocar uma ideia sobre [tema], tô por aqui. abraço!"

Retorne APENAS a mensagem.`;
            break;
    }
    try {
        const result = await model.generateContent(`${prompt}\n\n${instruction}`);
        return result.response.text().trim();
    }
    catch (error) {
        console.error('[Prospecção] Erro ao gerar follow-up:', error);
        return gerarFollowUpFallback(followupNumber);
    }
}
async function responderProspeccao(lead, mensagemDoLead, historicoMensagens) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    // Detecta intenção da resposta
    const intencao = detectarIntencaoResposta(mensagemDoLead);
    // Busca conhecimento relevante
    const query = `prospecção resposta ${intencao} ${lead.category}`;
    const chunks = await getRelevantProspeccaoChunks(query, 3);
    const knowledge = chunks.map(c => `- ${c.title}: ${c.content}`).join('\n');
    const context = buildLeadContext(lead);
    const prompt = PROSPECCAO_SYSTEM_PROMPT
        .replace('{knowledge}', knowledge)
        .replace('{context}', context);
    const instruction = `O lead respondeu: "${mensagemDoLead}"

${historicoMensagens ? `Histórico: ${historicoMensagens.join(' | ')}` : ''}

Analise a resposta e:
1. Gere uma resposta apropriada (curta, humana)
2. Defina a ação: continuar qualificando, marcar como qualificado, desqualificar, ou passar pro closer

Retorne em JSON:
{"resposta": "sua mensagem aqui", "acao": "continuar|qualificado|desqualificado|passar_closer", "motivo": "explicação curta"}

Retorne APENAS o JSON.`;
    try {
        const result = await model.generateContent(`${prompt}\n\n${instruction}`);
        const text = result.response.text().trim();
        const json = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
        return {
            resposta: json.resposta,
            acao: json.acao || 'continuar'
        };
    }
    catch (error) {
        console.error('[Prospecção] Erro ao responder:', error);
        return {
            resposta: 'opa, interessante! me conta mais sobre como funciona aí hoje?',
            acao: 'continuar'
        };
    }
}
// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================
function buildLeadContext(lead) {
    const parts = [
        `Negócio: ${lead.businessName}`,
        `Segmento: ${lead.category}`,
        `Status: ${lead.status}`,
        `Follow-ups feitos: ${lead.followupCount}`
    ];
    if (lead.rating)
        parts.push(`Avaliação: ${lead.rating} (${lead.reviewCount} reviews)`);
    if (lead.address)
        parts.push(`Local: ${lead.address}`);
    if (lead.notes)
        parts.push(`Notas: ${lead.notes}`);
    return parts.join('\n');
}
function detectarIntencaoResposta(mensagem) {
    const lower = mensagem.toLowerCase();
    if (/n[aã]o (preciso|quero|tenho interesse)/i.test(lower))
        return 'rejeicao';
    if (/para|n[aã]o me (mande|incomode)/i.test(lower))
        return 'bloqueio';
    if (/quanto custa|pre[cç]o|valor/i.test(lower))
        return 'interesse_preco';
    if (/como funciona|me (explica|conta)/i.test(lower))
        return 'interesse_alto';
    if (/j[aá] (tenho|uso)/i.test(lower))
        return 'objecao_ja_tem';
    if (/sem tempo|ocupado|correria/i.test(lower))
        return 'objecao_tempo';
    if (/(quem|fala com|passa pra)/i.test(lower))
        return 'indica_outro';
    if (/ok|hm|entendi|legal/i.test(lower))
        return 'resposta_curta';
    return 'neutro';
}
function gerarMensagemFallback(lead) {
    const ganchos = [
        `oi! vi a ${lead.businessName} no Google`,
        `oi! achei vcs pesquisando ${lead.category}`,
    ];
    const perguntas = [
        'vcs atendem bastante cliente pelo WhatsApp?',
        'como tá o movimento aí?',
        'vcs respondem todo mundo que manda msg no zap?'
    ];
    const gancho = ganchos[Math.floor(Math.random() * ganchos.length)];
    const pergunta = perguntas[Math.floor(Math.random() * perguntas.length)];
    return `${gancho}. ${pergunta}`;
}
function gerarFollowUpFallback(numero) {
    switch (numero) {
        case 1:
            return 'oi! mandei uma msg dias atrás, não sei se viu. faz sentido a gente trocar uma ideia ou tô falando com a pessoa errada?';
        case 2:
            return 'oi de novo! só passando pra ver se conseguiu pensar sobre o que conversamos. qualquer dúvida, tô por aqui!';
        default:
            return 'oi! última tentativa aqui rs. se não fizer sentido, sem stress! mas se quiser trocar uma ideia, tô por aqui. abraço!';
    }
}
// ============================================================
// CADÊNCIA DE FOLLOW-UP
// ============================================================
function calcularProximoFollowUp(lead) {
    if (lead.followupCount >= 3)
        return null; // Máximo 3 follow-ups
    if (lead.status === 'desqualificado' || lead.status === 'passou_closer')
        return null;
    const now = new Date();
    const lastContact = lead.lastContactAt || lead.createdAt;
    // Dias de espera por follow-up
    const diasEspera = [2, 4, 7]; // Follow-up 1, 2, 3
    const dias = diasEspera[lead.followupCount] || 7;
    const proximoFollowUp = new Date(lastContact);
    proximoFollowUp.setDate(proximoFollowUp.getDate() + dias);
    return proximoFollowUp;
}
function deveEnviarFollowUp(lead) {
    const proximo = calcularProximoFollowUp(lead);
    if (!proximo)
        return false;
    return new Date() >= proximo;
}
//# sourceMappingURL=prospeccao.js.map