import { v4 as uuidv4 } from 'uuid'
import { User } from '../../services/database'
import { generatePrayer } from '../../services/gemini'

export async function addPrayerRequest(phone: string, request: string): Promise<string> {
  const user = await User.findOne({ phone })
  if (!user) throw new Error('Usuario nao encontrado')

  const prayerRequest = {
    id: uuidv4(),
    request,
    createdAt: new Date(),
    status: 'active' as const,
    followUpSent: false
  }

  user.prayerRequests.push(prayerRequest)
  await user.save()

  return await generatePrayer(request, user.name)
}

export async function getPrayerRequests(phone: string) {
  const user = await User.findOne({ phone })
  if (!user) return []

  return user.prayerRequests
    .filter(r => r.status === 'active')
    .map(r => ({ id: r.id, request: r.request, createdAt: r.createdAt }))
}

export async function markPrayerAnswered(phone: string, prayerId: string) {
  const user = await User.findOne({ phone })
  if (!user) return

  const prayer = user.prayerRequests.find(r => r.id === prayerId)
  if (prayer) {
    prayer.status = 'answered'
    await user.save()
  }
}
