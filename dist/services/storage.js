"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAudio = uploadAudio;
exports.uploadVideo = uploadVideo;
exports.getSignedDownloadUrl = getSignedDownloadUrl;
exports.downloadAndStore = downloadAndStore;
exports.isStorageConfigured = isStorageConfigured;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const config_1 = require("../config");
const uuid_1 = require("uuid");
// Cloudflare R2 usa API compatível com S3
const s3Client = new client_s3_1.S3Client({
    region: 'auto',
    endpoint: `https://${config_1.config.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: config_1.config.r2.accessKeyId,
        secretAccessKey: config_1.config.r2.secretAccessKey
    }
});
/**
 * Faz upload de um arquivo de áudio para o R2
 * @param audioBuffer - Buffer do arquivo de áudio
 * @param fileName - Nome do arquivo (opcional, será gerado se não fornecido)
 * @returns URL pública do arquivo
 */
async function uploadAudio(audioBuffer, fileName, contentType = 'audio/mpeg') {
    const key = fileName || `songs/${(0, uuid_1.v4)()}.mp3`;
    try {
        await s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: config_1.config.r2.bucketName,
            Key: key,
            Body: audioBuffer,
            ContentType: contentType
        }));
        console.log(`[R2] Upload concluído: ${key}`);
        // Retorna URL pública se configurada, senão retorna a key
        if (config_1.config.r2.publicUrl) {
            return `${config_1.config.r2.publicUrl}/${key}`;
        }
        return key;
    }
    catch (error) {
        console.error('[R2] Erro no upload:', error);
        throw new Error('Erro ao fazer upload do áudio');
    }
}
/**
 * Faz upload de um vídeo para o R2
 * @param videoBuffer - Buffer do arquivo de vídeo
 * @param fileName - Nome do arquivo (opcional)
 * @returns URL pública do arquivo
 */
async function uploadVideo(videoBuffer, fileName) {
    const key = fileName || `videos/${(0, uuid_1.v4)()}.mp4`;
    try {
        await s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: config_1.config.r2.bucketName,
            Key: key,
            Body: videoBuffer,
            ContentType: 'video/mp4'
        }));
        console.log(`[R2] Upload de vídeo concluído: ${key}`);
        if (config_1.config.r2.publicUrl) {
            return `${config_1.config.r2.publicUrl}/${key}`;
        }
        return key;
    }
    catch (error) {
        console.error('[R2] Erro no upload de vídeo:', error);
        throw new Error('Erro ao fazer upload do vídeo');
    }
}
/**
 * Gera URL assinada temporária para download
 * @param key - Chave do objeto no bucket
 * @param expiresIn - Tempo de expiração em segundos (default: 1 hora)
 * @returns URL assinada
 */
async function getSignedDownloadUrl(key, expiresIn = 3600) {
    try {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: config_1.config.r2.bucketName,
            Key: key
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn });
    }
    catch (error) {
        console.error('[R2] Erro ao gerar URL assinada:', error);
        throw new Error('Erro ao gerar link de download');
    }
}
/**
 * Baixa arquivo de uma URL externa e salva no R2
 * @param url - URL do arquivo para baixar
 * @param fileName - Nome para salvar (opcional)
 * @returns URL pública do arquivo salvo
 */
async function downloadAndStore(url, fileName, contentType = 'audio/mpeg') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro ao baixar: ${response.status}`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        return await uploadAudio(buffer, fileName, contentType);
    }
    catch (error) {
        console.error('[R2] Erro ao baixar e armazenar:', error);
        throw new Error('Erro ao processar arquivo');
    }
}
/**
 * Verifica se o storage R2 está configurado
 */
function isStorageConfigured() {
    return !!(config_1.config.r2.accountId &&
        config_1.config.r2.accessKeyId &&
        config_1.config.r2.secretAccessKey &&
        config_1.config.r2.bucketName);
}
//# sourceMappingURL=storage.js.map