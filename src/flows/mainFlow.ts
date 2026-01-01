import { addKeyword, EVENTS } from '@builderbot/bot'
import type { BaileysProvider } from '@builderbot/provider-baileys'

export const mainFlow = addKeyword<BaileysProvider>(EVENTS.ACTION)
  .addAction(async (ctx, { flowDynamic }) => {
    const msg = ctx.body.toLowerCase()

    // Intent: Create music
    if (msg.includes('criar') || msg.includes('musica') || msg.includes('música') || msg.includes('nova')) {
      await flowDynamic('Para criar uma nova musica, digite *criar*')
      return
    }

    // Intent: Buy credits
    if (msg.includes('comprar') || msg.includes('credito') || msg.includes('crédito') || msg.includes('pix')) {
      await flowDynamic('Para comprar creditos, digite *comprar*')
      return
    }

    // Intent: My songs / history
    if (msg.includes('minhas') || msg.includes('historico') || msg.includes('histórico')) {
      await flowDynamic('Para ver suas musicas, digite *minhas*')
      return
    }

    // Default response with menu
    await flowDynamic([
      '*Saraiva* aqui!\n\nDigite:\n1. *criar* - Nova musica\n2. *minhas* - Suas musicas\n3. *comprar* - Creditos\n*menu* - Ver opcoes'
    ])
  })
