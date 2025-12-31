import { addKeyword } from '@builderbot/bot'
import type { BaileysProvider } from '@builderbot/provider-baileys'
import { startPlan, getNextDay, listPlans } from '../modules/planos/planManager'
import { plans } from '../modules/planos/plans'

export const planoFlow = addKeyword<BaileysProvider>(['plano', 'planos', 'leitura', '4'])
  .addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic(listPlans())
  })

export const planoSelectFlow = addKeyword<BaileysProvider>(['1', '2'])
  .addAction(async (ctx, { flowDynamic, state }) => {
    const inQuiz = await state.get('inQuiz')
    if (inQuiz) return // Don't interfere with quiz

    const selection = parseInt(ctx.body) - 1
    if (selection >= 0 && selection < plans.length) {
      const message = await startPlan(ctx.from, plans[selection].id)
      await flowDynamic(message)
    }
  })

export const planoProximoFlow = addKeyword<BaileysProvider>(['próximo', 'proximo', 'terminei', 'li'])
  .addAction(async (ctx, { flowDynamic }) => {
    const message = await getNextDay(ctx.from)
    if (message) {
      await flowDynamic(message)
    } else {
      await flowDynamic('Você não está em um plano. Digite "planos" para começar!')
    }
  })
