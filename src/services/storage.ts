import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { config } from '../config'
import { v4 as uuidv4 } from 'uuid'

// Cloudflare R2 usa API compatível com S3
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey
  }
})

/**
 * Faz upload de um arquivo de áudio para o R2
 * @param audioBuffer - Buffer do arquivo de áudio
 * @param fileName - Nome do arquivo (opcional, será gerado se não fornecido)
 * @returns URL pública do arquivo
 */
export async function uploadAudio(
  audioBuffer: Buffer,
  fileName?: string,
  contentType: string = 'audio/mpeg'
): Promise<string> {
  const key = fileName || `songs/${uuidv4()}.mp3`

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: audioBuffer,
      ContentType: contentType
    }))

    console.log(`[R2] Upload concluído: ${key}`)

    // Retorna URL pública se configurada, senão retorna a key
    if (config.r2.publicUrl) {
      return `${config.r2.publicUrl}/${key}`
    }

    return key
  } catch (error) {
    console.error('[R2] Erro no upload:', error)
    throw new Error('Erro ao fazer upload do áudio')
  }
}

/**
 * Faz upload de um vídeo para o R2
 * @param videoBuffer - Buffer do arquivo de vídeo
 * @param fileName - Nome do arquivo (opcional)
 * @returns URL pública do arquivo
 */
export async function uploadVideo(
  videoBuffer: Buffer,
  fileName?: string
): Promise<string> {
  const key = fileName || `videos/${uuidv4()}.mp4`

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
      Body: videoBuffer,
      ContentType: 'video/mp4'
    }))

    console.log(`[R2] Upload de vídeo concluído: ${key}`)

    if (config.r2.publicUrl) {
      return `${config.r2.publicUrl}/${key}`
    }

    return key
  } catch (error) {
    console.error('[R2] Erro no upload de vídeo:', error)
    throw new Error('Erro ao fazer upload do vídeo')
  }
}

/**
 * Gera URL assinada temporária para download
 * @param key - Chave do objeto no bucket
 * @param expiresIn - Tempo de expiração em segundos (default: 1 hora)
 * @returns URL assinada
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key
    })

    return await getSignedUrl(s3Client, command, { expiresIn })
  } catch (error) {
    console.error('[R2] Erro ao gerar URL assinada:', error)
    throw new Error('Erro ao gerar link de download')
  }
}

/**
 * Baixa arquivo de uma URL externa e salva no R2
 * @param url - URL do arquivo para baixar
 * @param fileName - Nome para salvar (opcional)
 * @returns URL pública do arquivo salvo
 */
export async function downloadAndStore(
  url: string,
  fileName?: string,
  contentType: string = 'audio/mpeg'
): Promise<string> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Erro ao baixar: ${response.status}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    return await uploadAudio(buffer, fileName, contentType)
  } catch (error) {
    console.error('[R2] Erro ao baixar e armazenar:', error)
    throw new Error('Erro ao processar arquivo')
  }
}

/**
 * Verifica se o storage R2 está configurado
 */
export function isStorageConfigured(): boolean {
  return !!(
    config.r2.accountId &&
    config.r2.accessKeyId &&
    config.r2.secretAccessKey &&
    config.r2.bucketName
  )
}
