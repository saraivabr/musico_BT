"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMusic = generateMusic;
exports.generateLyrics = generateLyrics;
exports.checkTaskStatus = checkTaskStatus;
exports.generateVideo = generateVideo;
exports.waitForCompletion = waitForCompletion;
exports.getCredits = getCredits;
const config_1 = require("../config");
const API_BASE = config_1.config.suno.apiUrl;
const API_KEY = config_1.config.suno.apiKey;
async function makeRequest(endpoint, method = 'GET', body) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        }
    };
    if (body && method === 'POST') {
        options.body = JSON.stringify(body);
    }
    console.log(`[SUNO] ${method} ${endpoint}`);
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SUNO] Erro ${response.status}: ${errorText}`);
        throw new Error(`Suno API error: ${response.status} - ${errorText}`);
    }
    return response.json();
}
/**
 * Gera música a partir de descrição ou letra
 */
async function generateMusic(prompt, style, isCustomLyrics = false, title) {
    const body = {
        prompt: isCustomLyrics ? prompt : `${prompt}. Style: ${style}`,
        style: style,
        title: title,
        customMode: isCustomLyrics,
        model: 'v4.5'
    };
    const response = await makeRequest('/api/v1/generate', 'POST', body);
    if (response.code !== 0) {
        throw new Error(`Suno generate error: ${response.msg}`);
    }
    console.log(`[SUNO] Música em geração. TaskId: ${response.data.taskId}`);
    return response.data.taskId;
}
/**
 * Gera apenas letra (sem música)
 */
async function generateLyrics(theme, style) {
    const body = {
        prompt: `Create lyrics for a ${style} song about: ${theme}. Write in Portuguese (Brazilian).`,
    };
    const response = await makeRequest('/api/v1/lyrics', 'POST', body);
    if (response.code !== 0) {
        throw new Error(`Suno lyrics error: ${response.msg}`);
    }
    return {
        lyrics: response.data.lyrics,
        title: response.data.title
    };
}
/**
 * Verifica status da geração
 */
async function checkTaskStatus(taskId) {
    const response = await makeRequest(`/api/v1/generate/record-info?taskId=${taskId}`);
    if (response.code !== 0) {
        throw new Error(`Suno status error: ${response.msg}`);
    }
    return response.data;
}
/**
 * Gera vídeo com letra sincronizada
 */
async function generateVideo(songId) {
    const body = {
        songId: songId
    };
    const response = await makeRequest('/api/v1/mp4/generate', 'POST', body);
    if (response.code !== 0) {
        throw new Error(`Suno video error: ${response.msg}`);
    }
    return response.data.taskId;
}
/**
 * Aguarda conclusão da geração (polling)
 */
async function waitForCompletion(taskId, maxAttempts = 60, // 5 minutos (60 * 5s)
intervalMs = 5000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const status = await checkTaskStatus(taskId);
        console.log(`[SUNO] Status (${attempt + 1}/${maxAttempts}): ${status.status}`);
        if (status.status === 'completed') {
            return status;
        }
        if (status.status === 'failed') {
            throw new Error(`Geração falhou: ${status.errorMessage || 'Erro desconhecido'}`);
        }
        // Aguarda antes da próxima verificação
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    throw new Error('Timeout: geração demorou demais');
}
/**
 * Verifica créditos disponíveis na conta Suno
 */
async function getCredits() {
    const response = await makeRequest('/api/v1/generate/credit');
    return response.data.credits;
}
//# sourceMappingURL=sunoApi.js.map