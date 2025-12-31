import { addKeyword } from '@builderbot/bot'
import type { BaileysProvider } from '@builderbot/provider-baileys'
import { generateDevocional } from '../services/gemini'

export const devocionalFlow = addKeyword<BaileysProvider>(['devocional', 'versículo', 'versiculo', 'palavra do dia', '1'])
  .addAction(async (ctx, { flowDynamic }) => {
    await flowDynamic('Preparando seu devocional de hoje...')

    const { versiculo, reflexao } = await generateDevocional()

    await flowDynamic([
      '*Devocional do Dia*',
      '',
      `_"${versiculo}"_`,
      '',
      reflexao,
      '',
      'Que esse versículo te abençoe hoje!'
    ])
  })
