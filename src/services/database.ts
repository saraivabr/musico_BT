import mongoose, { Schema } from 'mongoose'
import { config } from '../config'
import type { IUser } from '../types/user'
import type { IConversation, IConversationSummary } from '../types/conversation'

// User Schema
const userSchema = new Schema<IUser>({
  phone: { type: String, required: true, unique: true, index: true },
  name: String,
  createdAt: { type: Date, default: Date.now },
  lastInteraction: { type: Date, default: Date.now },
  spiritualLevel: { type: String, enum: ['iniciante', 'crescendo', 'maduro'], default: 'iniciante' },
  currentPlan: {
    planId: String,
    day: Number,
    startedAt: Date
  },
  quizStats: {
    totalPoints: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 }
  },
  prayerRequests: [{
    id: String,
    request: String,
    createdAt: Date,
    status: { type: String, enum: ['active', 'answered'], default: 'active' },
    followUpSent: { type: Boolean, default: false }
  }],
  referredBy: String,
  referrals: [String],
  preferences: {
    devocionalEnabled: { type: Boolean, default: true },
    devocionalTime: { type: String, default: '06:00' }
  }
})

// Conversation Schema with compound index
const conversationSchema = new Schema<IConversation>({
  phone: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true, maxlength: 10000 },
  intent: String,
  emotion: String
})

// Compound index for efficient queries
conversationSchema.index({ phone: 1, timestamp: -1 })

// Summary Schema
const summarySchema = new Schema<IConversationSummary>({
  phone: { type: String, required: true, unique: true },
  summary: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  keyTopics: [String]
})

export const User = mongoose.model<IUser>('User', userSchema)
export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema)
export const ConversationSummary = mongoose.model<IConversationSummary>('ConversationSummary', summarySchema)

// Phone validation helper
function validatePhone(phone: string): void {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number is required')
  }
  // Remove non-digits and check length (10-15 digits for international)
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) {
    throw new Error('Invalid phone number format')
  }
}

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongodb.uri)
    console.log('[DB] MongoDB conectado com sucesso')
  } catch (error) {
    console.error('[DB] Erro ao conectar MongoDB:', error)
    process.exit(1)
  }
}

export async function getOrCreateUser(phone: string): Promise<IUser> {
  validatePhone(phone)

  try {
    let user = await User.findOne({ phone })
    if (!user) {
      user = await User.create({ phone })
      console.log(`[DB] Novo usuário criado: ${phone}`)
    }
    return user
  } catch (error) {
    console.error(`[DB] Erro ao buscar/criar usuário ${phone}:`, error)
    throw error
  }
}

export async function updateUser(phone: string, data: Partial<IUser>): Promise<IUser | null> {
  validatePhone(phone)

  // Prevent overwriting system fields
  const { createdAt, phone: _, ...safeData } = data as any

  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { ...safeData, lastInteraction: new Date() },
      { new: true }
    )
    return user
  } catch (error) {
    console.error(`[DB] Erro ao atualizar usuário ${phone}:`, error)
    throw error
  }
}

export async function saveConversation(
  phone: string,
  role: 'user' | 'assistant',
  content: string,
  intent?: string,
  emotion?: string
): Promise<void> {
  validatePhone(phone)

  if (!content || content.length === 0) {
    throw new Error('Content is required')
  }

  try {
    await Conversation.create({ phone, role, content, intent, emotion })
  } catch (error) {
    console.error(`[DB] Erro ao salvar conversa ${phone}:`, error)
    throw error
  }
}

export async function getRecentConversations(phone: string, limit = 20): Promise<IConversation[]> {
  validatePhone(phone)

  // Clamp limit to reasonable range
  const safeLimit = Math.min(Math.max(1, limit), 100)

  try {
    return await Conversation.find({ phone })
      .sort({ timestamp: -1 })
      .limit(safeLimit)
      .lean()
  } catch (error) {
    console.error(`[DB] Erro ao buscar conversas ${phone}:`, error)
    throw error
  }
}
