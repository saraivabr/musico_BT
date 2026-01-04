export interface IPurchase {
  id: string
  amount: number              // valor em centavos
  credits: number             // créditos comprados
  status: 'pending' | 'paid' | 'expired'
  pixCode: string             // código copia-cola
  pixQrCodeBase64?: string    // QR code em base64
  chargeId: string            // ID da cobrança no Woovi
  createdAt: Date
  paidAt?: Date
  expiresAt: Date
}

export interface IMusic {
  id: string
  prompt: string              // descrição ou letra enviada
  style: string               // estilo musical escolhido
  isCustomLyrics: boolean     // true se usuário enviou letra pronta
  generatedLyrics?: string    // letra gerada (se IA criou)
  status: 'generating' | 'ready' | 'failed'
  sunoTaskId: string
  audioUrl?: string
  videoUrl?: string
  downloadUrl?: string
  title?: string              // título da música
  createdAt: Date
  completedAt?: Date
  errorMessage?: string
}

export interface IUser {
  phone: string
  name?: string
  createdAt: Date
  lastInteraction: Date

  // Sistema de créditos
  credits: number

  // Histórico de compras
  purchases: IPurchase[]

  // Músicas criadas
  musics: IMusic[]

  // Estatísticas
  stats: {
    totalMusicsCreated: number
    totalCreditsSpent: number
    totalAmountPaid: number      // em centavos
  }
}

// Estilos musicais disponíveis
export const MUSIC_STYLES = [
  { id: 'pop', name: 'Pop', emoji: '🎤' },
  { id: 'sertanejo', name: 'Sertanejo', emoji: '🤠' },
  { id: 'funk', name: 'Funk', emoji: '🔊' },
  { id: 'rock', name: 'Rock', emoji: '🎸' },
  { id: 'gospel', name: 'Gospel', emoji: '🙏' },
  { id: 'rap', name: 'Rap/Hip-Hop', emoji: '🎤' },
  { id: 'mpb', name: 'MPB', emoji: '🇧🇷' },
  { id: 'forro', name: 'Forró', emoji: '🪗' },
  { id: 'eletronica', name: 'Eletrônica', emoji: '🎧' },
  { id: 'reggae', name: 'Reggae', emoji: '🟢' },
  { id: 'romantico', name: 'Romântico', emoji: '💕' },
  { id: 'infantil', name: 'Infantil', emoji: '👶' }
] as const

export type MusicStyleId = typeof MUSIC_STYLES[number]['id']

// Pacotes de créditos
export const CREDIT_PACKS = [
  { id: 'pack1', credits: 1, price: 999, description: '1 crédito' },
  { id: 'pack5', credits: 5, price: 3999, description: '5 créditos (20% off)' },
  { id: 'pack10', credits: 10, price: 6999, description: '10 créditos (30% off)' }
] as const

export type CreditPackId = typeof CREDIT_PACKS[number]['id']
