import { addKeyword } from '@builderbot/bot'
import type { BaileysProvider } from '@builderbot/provider-baileys'
import { addPrayerRequest, getPrayerRequests } from '../modules/oracao/prayerManager'

export const oracaoFlow = addKeyword<BaileysProvider>(['oracao', 'orar', 'ora comigo', '3'])
  .addAnswer(
    '*Oracao*\n\nEstou aqui para orar com voce.\n\nMe conta: qual e seu pedido de oracao?',
    { capture: true },
    async (ctx, { flowDynamic }) => {
      const request = ctx.body

      await flowDynamic('Recebendo seu pedido no coracao...')

      try {
        const prayer = await addPrayerRequest(ctx.from, request)

        await flowDynamic([
          '*Vamos orar juntos:*',
          '',
          `_${prayer}_`,
          '',
          'Amem.',
          '',
          'Seu pedido foi guardado. Vou te lembrar em breve!'
        ])
      } catch {
        await flowDynamic('Recebi seu pedido. Estou orando por voce!')
      }
    }
  )

export const meusPedidosFlow = addKeyword<BaileysProvider>(['meus pedidos', 'pedidos de oracao'])
  .addAction(async (ctx, { flowDynamic }) => {
    const requests = await getPrayerRequests(ctx.from)

    if (requests.length === 0) {
      await flowDynamic('Voce nao tem pedidos ativos. Digite "orar" para fazer um!')
      return
    }

    const list = requests
      .map((r, i) => `${i + 1}. "${r.request}"`)
      .join('\n')

    await flowDynamic([
      '*Seus Pedidos de Oracao*',
      '',
      list,
      '',
      'Continuo orando por voce!'
    ])
  })
