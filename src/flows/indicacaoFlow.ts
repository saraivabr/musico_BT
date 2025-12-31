import { addKeyword } from '@builderbot/bot'
import type { BaileysProvider } from '@builderbot/provider-baileys'
import { createReferral, extractPhoneNumber } from '../modules/indicacao/referralManager'

export const indicacaoFlow = addKeyword<BaileysProvider>(['indicar', 'amigo precisa', '7'])
  .addAnswer(
    '*Indicar um Amigo*\n\nQue lindo! Você quer ajudar alguém.\n\nMe conta: qual é o nome da pessoa e o que está acontecendo?',
    { capture: true },
    async (ctx, { flowDynamic, state }) => {
      await state.update({ referralContext: ctx.body, awaitingReferralPhone: true })
      await flowDynamic('Entendi. Agora me manda o número de WhatsApp dela.\n\n_Formato: (11) 99999-9999_')
    }
  )

export const indicacaoPhoneFlow = addKeyword<BaileysProvider>([/^\d/, /^\(/])
  .addAction(async (ctx, { flowDynamic, state, provider }) => {
    const awaitingPhone = await state.get('awaitingReferralPhone')
    if (!awaitingPhone) return

    const phone = extractPhoneNumber(ctx.body)
    if (!phone) {
      await flowDynamic('Não consegui identificar o número. Manda de novo.')
      return
    }

    const context = await state.get('referralContext')
    await state.update({ awaitingReferralPhone: false })

    try {
      const message = await createReferral({
        referrerPhone: ctx.from,
        referredPhone: phone,
        context
      })

      await (provider as any).sendMessage(phone, message, {})

      await flowDynamic([
        '*Mensagem enviada!*',
        '',
        'Acabei de mandar uma mensagem carinhosa pro seu amigo.',
        'Você fez algo muito bonito hoje!'
      ])
    } catch {
      await flowDynamic('Não consegui enviar agora, mas vou tentar novamente.')
    }
  })
