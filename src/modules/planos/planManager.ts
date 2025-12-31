import { User, updateUser } from '../../services/database'
import { getPlan, getPlanDay, plans } from './plans'

export async function startPlan(phone: string, planId: string): Promise<string> {
  const plan = getPlan(planId)
  if (!plan) throw new Error('Plano não encontrado')

  await updateUser(phone, {
    currentPlan: { planId, day: 1, startedAt: new Date() }
  })

  const dayContent = plan.days[0]
  return [
    `*Plano Iniciado: ${plan.name}*`,
    '',
    `Dia 1 de ${plan.duration}`,
    `*${dayContent.title}*`,
    `Leitura: ${dayContent.reading}`,
    '',
    'Leia com calma e depois me conta o que entendeu!'
  ].join('\n')
}

export async function getNextDay(phone: string): Promise<string | null> {
  const user = await User.findOne({ phone })
  if (!user?.currentPlan) return null

  const { planId, day } = user.currentPlan
  const plan = getPlan(planId)
  if (!plan) return null

  const nextDay = day + 1
  if (nextDay > plan.duration) {
    await updateUser(phone, { currentPlan: undefined })
    return `*PARABÉNS!*\n\nVocê completou "${plan.name}"!\n\nDigite "planos" para ver mais opções.`
  }

  await updateUser(phone, { currentPlan: { ...user.currentPlan, day: nextDay } })

  const dayContent = getPlanDay(planId, nextDay)
  return [
    `*Dia ${nextDay} de ${plan.duration}*`,
    `*${dayContent?.title}*`,
    `Leitura: ${dayContent?.reading}`,
    '',
    'Bons estudos!'
  ].join('\n')
}

export function listPlans(): string {
  return [
    '*Planos de Leitura*',
    '',
    ...plans.map((p, i) => `${i + 1}. *${p.name}* (${p.duration} dias)\n   _${p.description}_`),
    '',
    'Digite o número para começar!'
  ].join('\n')
}
