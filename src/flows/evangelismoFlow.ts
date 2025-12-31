import { addKeyword } from '@builderbot/bot'
import type { BaileysProvider } from '@builderbot/provider-baileys'
import { evangelismSteps, getNextStep, getStepMessage } from '../modules/evangelismo/journey'
import { updateUser } from '../services/database'

export const evangelismoFlow = addKeyword<BaileysProvider>(['conhecer jesus', 'aceitar jesus', 'quem é jesus', 'vida eterna'])
  .addAction(async (ctx, { flowDynamic, state }) => {
    const step = evangelismSteps[0]
    await state.update({ evangelismStep: step.id })
    await flowDynamic(step.message)
  })

export const evangelismoResponseFlow = addKeyword<BaileysProvider>(['sim', 'quero', 'continua', 'orei'])
  .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    const currentStepId = await state.get('evangelismStep')
    if (!currentStepId) return

    const nextStepId = getNextStep(currentStepId)

    if (!nextStepId) {
      await updateUser(ctx.from, { spiritualLevel: 'iniciante' })
      await state.update({ evangelismStep: null })
      await flowDynamic('Vamos começar sua jornada! Digite "planos" para ver os planos de leitura.')
      return
    }

    const message = getStepMessage(nextStepId)
    if (message) {
      await state.update({ evangelismStep: nextStepId })
      await flowDynamic(message)
    }
  })
