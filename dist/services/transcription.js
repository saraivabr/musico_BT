"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAudioMessage = processAudioMessage;
exports.isAudioMessage = isAudioMessage;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const config_1 = require("../config");
/**
 * Faz download do áudio do WhatsApp
 */
async function downloadAudio(mediaUrl) {
    try {
        const response = await axios_1.default.get(mediaUrl, {
            responseType: 'arraybuffer',
            timeout: 30000
        });
        return Buffer.from(response.data);
    }
    catch (error) {
        console.error('Erro ao baixar áudio:', error);
        throw new Error('Não consegui baixar seu áudio. Tenta novamente?');
    }
}
/**
 * Transcreve áudio para texto usando OpenAI Whisper
 */
async function transcribeAudioWithWhisper(audioBuffer) {
    try {
        const formData = new form_data_1.default();
        // Adiciona áudio ao form
        formData.append('file', audioBuffer, 'audio.mp3');
        formData.append('model', 'whisper-1');
        formData.append('language', 'pt');
        const response = await axios_1.default.post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${config_1.config.openai.apiKey}`
            },
            timeout: 60000
        });
        const transcript = response.data.text?.trim();
        if (!transcript) {
            throw new Error('Transcrição vazia');
        }
        return transcript;
    }
    catch (error) {
        console.error('Erro ao transcrever com Whisper:', error);
        throw new Error('Não consegui entender seu áudio. Tenta de novo ou descreve em texto?');
    }
}
/**
 * Processa áudio do WhatsApp (download + transcrição)
 * @param mediaUrl URL do áudio do WhatsApp
 * @returns Transcrição em texto
 */
async function processAudioMessage(mediaUrl) {
    try {
        const audioBuffer = await downloadAudio(mediaUrl);
        // Validar tamanho
        if (audioBuffer.length > 25 * 1024 * 1024) {
            throw new Error('Áudio muito grande (máx 25MB)');
        }
        const transcript = await transcribeAudioWithWhisper(audioBuffer);
        return transcript;
    }
    catch (error) {
        throw new Error(error.message || 'Erro ao processar áudio');
    }
}
/**
 * Valida se é mensagem de áudio
 */
function isAudioMessage(message) {
    return (message.media &&
        (message.media.type === 'audio' || message.media.mimetype?.startsWith('audio/')));
}
//# sourceMappingURL=transcription.js.map