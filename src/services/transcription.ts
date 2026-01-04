import axios from 'axios'
import FormData from 'form-data'
import { config } from '../config'

/**
 * Faz download do áudio do WhatsApp
 */
async function downloadAudio(mediaUrl: string): Promise<Buffer> {
  try {
    const response = await axios.get(mediaUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    })
    return Buffer.from(response.data)
  } catch (error) {
    console.error('Erro ao baixar áudio:', error)
    throw new Error('Não consegui baixar seu áudio. Tenta novamente?')
  }
}

/**
 * Transcreve áudio para texto usando OpenAI Whisper
 */
async function transcribeAudioWithWhisper(
  audioBuffer: Buffer
): Promise<string> {
  try {
    const formData = new FormData()

    // Adiciona áudio ao form
    formData.append('file', audioBuffer, 'audio.mp3')
    formData.append('model', 'whisper-1')
    formData.append('language', 'pt')

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${config.openai.apiKey}`
        },
        timeout: 60000
      }
    )

    const transcript = response.data.text?.trim()

    if (!transcript) {
      throw new Error('Transcrição vazia')
    }

    return transcript
  } catch (error) {
    console.error('Erro ao transcrever com Whisper:', error)
    throw new Error(
      'Não consegui entender seu áudio. Tenta de novo ou descreve em texto?'
    )
  }
}

/**
 * Processa áudio do WhatsApp (download + transcrição)
 * @param mediaUrl URL do áudio do WhatsApp
 * @returns Transcrição em texto
 */
export async function processAudioMessage(mediaUrl: string): Promise<string> {
  try {
    const audioBuffer = await downloadAudio(mediaUrl)

    // Validar tamanho
    if (audioBuffer.length > 25 * 1024 * 1024) {
      throw new Error('Áudio muito grande (máx 25MB)')
    }

    const transcript = await transcribeAudioWithWhisper(audioBuffer)
    return transcript
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao processar áudio')
  }
}

/**
 * Valida se é mensagem de áudio
 */
export function isAudioMessage(message: any): boolean {
  return (
    message.media &&
    (message.media.type === 'audio' || message.media.mimetype?.startsWith('audio/'))
  )
}
