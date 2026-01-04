import mongoose, { Schema } from 'mongoose'
import { config } from '../config'
import type { IUser, IPurchase, IMusic } from '../types/user'

// Purchase Sub-Schema
const purchaseSchema = new Schema<IPurchase>({
  id: { type: String, required: true },
  amount: { type: Number, required: true },
  credits: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'expired'], default: 'pending' },
  pixCode: { type: String, required: true },
  pixQrCodeBase64: String,
  chargeId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  paidAt: Date,
  expiresAt: { type: Date, required: true }
}, { _id: false })

// Music Sub-Schema
const musicSchema = new Schema<IMusic>({
  id: { type: String, required: true },
  prompt: { type: String, required: true },
  style: { type: String, required: true },
  isCustomLyrics: { type: Boolean, default: false },
  generatedLyrics: String,
  status: { type: String, enum: ['generating', 'ready', 'failed'], default: 'generating' },
  sunoTaskId: { type: String, required: true },
  audioUrl: String,
  videoUrl: String,
  downloadUrl: String,
  title: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  errorMessage: String
}, { _id: false })

// User Schema
const userSchema = new Schema<IUser>({
  phone: { type: String, required: true, unique: true, index: true },
  name: String,
  createdAt: { type: Date, default: Date.now },
  lastInteraction: { type: Date, default: Date.now },
  credits: { type: Number, default: 0 },
  purchases: [purchaseSchema],
  musics: [musicSchema],
  stats: {
    totalMusicsCreated: { type: Number, default: 0 },
    totalCreditsSpent: { type: Number, default: 0 },
    totalAmountPaid: { type: Number, default: 0 }
  }
})

export const User = mongoose.model<IUser>('User', userSchema)

// ==================== Helpers ====================

function validatePhone(phone: string): void {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number is required')
  }
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) {
    throw new Error('Invalid phone number format')
  }
}

// ==================== Connection ====================

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.mongodb.uri)
    console.log('[DB] MongoDB conectado com sucesso')
  } catch (error) {
    console.error('[DB] Erro ao conectar MongoDB:', error)
    process.exit(1)
  }
}

// ==================== User Operations ====================

export async function getOrCreateUser(phone: string): Promise<IUser> {
  validatePhone(phone)

  try {
    let user = await User.findOne({ phone })
    if (!user) {
      user = await User.create({
        phone,
        credits: 0,
        purchases: [],
        musics: [],
        stats: {
          totalMusicsCreated: 0,
          totalCreditsSpent: 0,
          totalAmountPaid: 0
        }
      })
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

export async function getUserByPhone(phone: string): Promise<IUser | null> {
  validatePhone(phone)
  return User.findOne({ phone })
}

// ==================== Credit Operations ====================

export async function addCredits(phone: string, credits: number): Promise<IUser | null> {
  validatePhone(phone)

  try {
    const user = await User.findOneAndUpdate(
      { phone },
      {
        $inc: { credits: credits },
        lastInteraction: new Date()
      },
      { new: true }
    )
    console.log(`[DB] +${credits} créditos para ${phone}. Total: ${user?.credits}`)
    return user
  } catch (error) {
    console.error(`[DB] Erro ao adicionar créditos ${phone}:`, error)
    throw error
  }
}

export async function deductCredit(phone: string): Promise<boolean> {
  validatePhone(phone)

  try {
    const result = await User.findOneAndUpdate(
      { phone, credits: { $gte: 1 } },
      {
        $inc: {
          credits: -1,
          'stats.totalCreditsSpent': 1
        },
        lastInteraction: new Date()
      },
      { new: true }
    )

    if (!result) {
      console.log(`[DB] Créditos insuficientes para ${phone}`)
      return false
    }

    console.log(`[DB] -1 crédito de ${phone}. Restam: ${result.credits}`)
    return true
  } catch (error) {
    console.error(`[DB] Erro ao debitar crédito ${phone}:`, error)
    throw error
  }
}

export async function getCredits(phone: string): Promise<number> {
  const user = await getUserByPhone(phone)
  return user?.credits || 0
}

// ==================== Purchase Operations ====================

export async function addPurchase(phone: string, purchase: IPurchase): Promise<IUser | null> {
  validatePhone(phone)

  try {
    const user = await User.findOneAndUpdate(
      { phone },
      {
        $push: { purchases: purchase },
        lastInteraction: new Date()
      },
      { new: true }
    )
    console.log(`[DB] Nova compra ${purchase.id} para ${phone}`)
    return user
  } catch (error) {
    console.error(`[DB] Erro ao adicionar compra ${phone}:`, error)
    throw error
  }
}

export async function updatePurchaseStatus(
  phone: string,
  purchaseId: string,
  status: 'pending' | 'paid' | 'expired',
  paidAt?: Date
): Promise<IUser | null> {
  validatePhone(phone)

  try {
    const updateData: any = {
      'purchases.$.status': status,
      lastInteraction: new Date()
    }

    if (paidAt) {
      updateData['purchases.$.paidAt'] = paidAt
    }

    const user = await User.findOneAndUpdate(
      { phone, 'purchases.id': purchaseId },
      { $set: updateData },
      { new: true }
    )
    console.log(`[DB] Compra ${purchaseId} atualizada: ${status}`)
    return user
  } catch (error) {
    console.error(`[DB] Erro ao atualizar compra ${phone}:`, error)
    throw error
  }
}

export async function findPurchaseByCorrelationId(correlationId: string): Promise<{
  phone: string
  purchase: IPurchase
} | null> {
  try {
    const user = await User.findOne({ 'purchases.id': correlationId })
    if (!user) return null

    const purchase = user.purchases.find(p => p.id === correlationId)
    if (!purchase) return null

    return { phone: user.phone, purchase }
  } catch (error) {
    console.error(`[DB] Erro ao buscar compra ${correlationId}:`, error)
    throw error
  }
}

export async function confirmPurchaseAndAddCredits(
  correlationId: string
): Promise<{ phone: string; credits: number } | null> {
  try {
    const result = await findPurchaseByCorrelationId(correlationId)
    if (!result) {
      console.warn(`[DB] Compra não encontrada: ${correlationId}`)
      return null
    }

    const { phone, purchase } = result

    if (purchase.status === 'paid') {
      console.log(`[DB] Compra ${correlationId} já confirmada`)
      return { phone, credits: purchase.credits }
    }

    // Atualiza status e adiciona créditos
    await User.findOneAndUpdate(
      { phone, 'purchases.id': correlationId },
      {
        $set: {
          'purchases.$.status': 'paid',
          'purchases.$.paidAt': new Date()
        },
        $inc: {
          credits: purchase.credits,
          'stats.totalAmountPaid': purchase.amount
        },
        lastInteraction: new Date()
      }
    )

    console.log(`[DB] Compra ${correlationId} confirmada. +${purchase.credits} créditos para ${phone}`)
    return { phone, credits: purchase.credits }
  } catch (error) {
    console.error(`[DB] Erro ao confirmar compra ${correlationId}:`, error)
    throw error
  }
}

// ==================== Music Operations ====================

export async function addMusic(phone: string, music: IMusic): Promise<IUser | null> {
  validatePhone(phone)

  try {
    const user = await User.findOneAndUpdate(
      { phone },
      {
        $push: { musics: music },
        $inc: { 'stats.totalMusicsCreated': 1 },
        lastInteraction: new Date()
      },
      { new: true }
    )
    console.log(`[DB] Nova música ${music.id} para ${phone}`)
    return user
  } catch (error) {
    console.error(`[DB] Erro ao adicionar música ${phone}:`, error)
    throw error
  }
}

export async function updateMusicStatus(
  phone: string,
  musicId: string,
  updates: Partial<IMusic>
): Promise<IUser | null> {
  validatePhone(phone)

  try {
    const setUpdates: any = { lastInteraction: new Date() }

    for (const [key, value] of Object.entries(updates)) {
      setUpdates[`musics.$.${key}`] = value
    }

    const user = await User.findOneAndUpdate(
      { phone, 'musics.id': musicId },
      { $set: setUpdates },
      { new: true }
    )
    console.log(`[DB] Música ${musicId} atualizada`)
    return user
  } catch (error) {
    console.error(`[DB] Erro ao atualizar música ${phone}:`, error)
    throw error
  }
}

export async function getUserMusics(phone: string, limit = 10): Promise<IMusic[]> {
  validatePhone(phone)

  const user = await getUserByPhone(phone)
  if (!user) return []

  return user.musics
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export async function findMusicByTaskId(taskId: string): Promise<{
  phone: string
  music: IMusic
} | null> {
  try {
    const user = await User.findOne({ 'musics.sunoTaskId': taskId })
    if (!user) return null

    const music = user.musics.find(m => m.sunoTaskId === taskId)
    if (!music) return null

    return { phone: user.phone, music }
  } catch (error) {
    console.error(`[DB] Erro ao buscar música por taskId ${taskId}:`, error)
    throw error
  }
}

// ==================== Stats ====================

export async function getUserStats(phone: string): Promise<IUser['stats'] | null> {
  const user = await getUserByPhone(phone)
  return user?.stats || null
}
