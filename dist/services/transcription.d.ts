/**
 * Processa áudio do WhatsApp (download + transcrição)
 * @param mediaUrl URL do áudio do WhatsApp
 * @returns Transcrição em texto
 */
export declare function processAudioMessage(mediaUrl: string): Promise<string>;
/**
 * Valida se é mensagem de áudio
 */
export declare function isAudioMessage(message: any): boolean;
//# sourceMappingURL=transcription.d.ts.map