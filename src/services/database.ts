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

// Conversation Schema
const conversationSchema = new Schema<IConversation>({
  phone: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  intent: String,
  emotion: String
})

// Summary Schema
const summarySchema = new Schema<IConversationSummary>({
  phone: { type: String, required: true, unique: true },
  summary: String,
  updatedAt: { type: Date, default: Date.now },
  keyTopics: [String]
})

export const User = mongoose.model<IUser>('User', userSchema)
export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema)
export const ConversationSummary = mongoose.model<IConversationSummary>('ConversationSummary', summarySchema)

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongodb.uri)
    console.log('MongoDB conectado com sucesso')
  } catch (error) {
    console.error('Erro ao conectar MongoDB:', error)
    process.exit(1)
  }
}

export async function getOrCreateUser(phone: string): Promise<IUser> {
  let user = await User.findOne({ phone })
  if (!user) {
    user = await User.create({ phone })
  }
  return user
}

export async function updateUser(phone: string, data: Partial<IUser>): Promise<IUser | null> {
  return User.findOneAndUpdate(
    { phone },
    { ...data, lastInteraction: new Date() },
    { new: true }
  )
}

export async function saveConversation(
  phone: string,
  role: 'user' | 'assistant',
  content: string,
  intent?: string,
  emotion?: string
): Promise<void> {
  await Conversation.create({ phone, role, content, intent, emotion })
}

export async function getRecentConversations(phone: string, limit = 20): Promise<IConversation[]> {
  return Conversation.find({ phone })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean()
}
