import { config } from '../config'

interface SunoGenerateRequest {
  prompt: string           // descrição ou letra
  style?: string           // estilo musical
  title?: string           // título opcional
  customMode?: boolean     // true se é letra customizada
  instrumental?: boolean   // só instrumental
  model?: string           // versão do modelo (v4, v4.5, v5)
}

interface SunoGenerateResponse {
  code: number
  msg: string
  data: {
    taskId: string
  }
}

interface SunoTaskStatus {
  code: number
  msg: string
  data: {
    status: 'pending' | 'processing' | 'completed' | 'failed'
    songs?: Array<{
      id: string
      title: string
      audioUrl: string
      videoUrl?: string
      imageUrl?: string
      duration: number
      lyrics?: string
    }>
    errorMessage?: string
  }
}

interface SunoLyricsResponse {
  code: number
  msg: string
  data: {
    lyrics: string
    title: string
  }
}

interface SunoVideoResponse {
  code: number
  msg: string
  data: {
    taskId: string
  }
}

const API_BASE = config.suno.apiUrl
const API_KEY = config.suno.apiKey

async function makeRequest<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: object): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    }
  }

  if (body && method === 'POST') {
    options.body = JSON.stringify(body)
  }

  console.log(`[SUNO] ${method} ${endpoint}`)

  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[SUNO] Erro ${response.status}: ${errorText}`)
    throw new Error(`Suno API error: ${response.status} - ${errorText}`)
  }

  return response.json() as T
}

/**
 * Gera música a partir de descrição ou letra
 */
export async function generateMusic(
  prompt: string,
  style: string,
  isCustomLyrics: boolean = false,
  title?: string
): Promise<string> {
  const body: SunoGenerateRequest = {
    prompt: isCustomLyrics ? prompt : `${prompt}. Style: ${style}`,
    style: style,
    title: title,
    customMode: isCustomLyrics,
    model: 'v4.5'
  }

  const response = await makeRequest<SunoGenerateResponse>('/api/v1/generate', 'POST', body)

  if (response.code !== 0) {
    throw new Error(`Suno generate error: ${response.msg}`)
  }

  console.log(`[SUNO] Música em geração. TaskId: ${response.data.taskId}`)
  return response.data.taskId
}

/**
 * Gera apenas letra (sem música)
 */
export async function generateLyrics(theme: string, style: string): Promise<{ lyrics: string; title: string }> {
  const body = {
    prompt: `Create lyrics for a ${style} song about: ${theme}. Write in Portuguese (Brazilian).`,
  }

  const response = await makeRequest<SunoLyricsResponse>('/api/v1/lyrics', 'POST', body)

  if (response.code !== 0) {
    throw new Error(`Suno lyrics error: ${response.msg}`)
  }

  return {
    lyrics: response.data.lyrics,
    title: response.data.title
  }
}

/**
 * Verifica status da geração
 */
export async function checkTaskStatus(taskId: string): Promise<SunoTaskStatus['data']> {
  const response = await makeRequest<SunoTaskStatus>(`/api/v1/generate/record-info?taskId=${taskId}`)

  if (response.code !== 0) {
    throw new Error(`Suno status error: ${response.msg}`)
  }

  return response.data
}

/**
 * Gera vídeo com letra sincronizada
 */
export async function generateVideo(songId: string): Promise<string> {
  const body = {
    songId: songId
  }

  const response = await makeRequest<SunoVideoResponse>('/api/v1/mp4/generate', 'POST', body)

  if (response.code !== 0) {
    throw new Error(`Suno video error: ${response.msg}`)
  }

  return response.data.taskId
}

/**
 * Aguarda conclusão da geração (polling)
 */
export async function waitForCompletion(
  taskId: string,
  maxAttempts: number = 60,  // 5 minutos (60 * 5s)
  intervalMs: number = 5000
): Promise<SunoTaskStatus['data']> {

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await checkTaskStatus(taskId)

    console.log(`[SUNO] Status (${attempt + 1}/${maxAttempts}): ${status.status}`)

    if (status.status === 'completed') {
      return status
    }

    if (status.status === 'failed') {
      throw new Error(`Geração falhou: ${status.errorMessage || 'Erro desconhecido'}`)
    }

    // Aguarda antes da próxima verificação
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('Timeout: geração demorou demais')
}

/**
 * Verifica créditos disponíveis na conta Suno
 */
export async function getCredits(): Promise<number> {
  const response = await makeRequest<{ code: number; data: { credits: number } }>('/api/v1/generate/credit')
  return response.data.credits
}
