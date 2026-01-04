/**
 * Faz upload de um arquivo de áudio para o R2
 * @param audioBuffer - Buffer do arquivo de áudio
 * @param fileName - Nome do arquivo (opcional, será gerado se não fornecido)
 * @returns URL pública do arquivo
 */
export declare function uploadAudio(audioBuffer: Buffer, fileName?: string, contentType?: string): Promise<string>;
/**
 * Faz upload de um vídeo para o R2
 * @param videoBuffer - Buffer do arquivo de vídeo
 * @param fileName - Nome do arquivo (opcional)
 * @returns URL pública do arquivo
 */
export declare function uploadVideo(videoBuffer: Buffer, fileName?: string): Promise<string>;
/**
 * Gera URL assinada temporária para download
 * @param key - Chave do objeto no bucket
 * @param expiresIn - Tempo de expiração em segundos (default: 1 hora)
 * @returns URL assinada
 */
export declare function getSignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
/**
 * Baixa arquivo de uma URL externa e salva no R2
 * @param url - URL do arquivo para baixar
 * @param fileName - Nome para salvar (opcional)
 * @returns URL pública do arquivo salvo
 */
export declare function downloadAndStore(url: string, fileName?: string, contentType?: string): Promise<string>;
/**
 * Verifica se o storage R2 está configurado
 */
export declare function isStorageConfigured(): boolean;
//# sourceMappingURL=storage.d.ts.map