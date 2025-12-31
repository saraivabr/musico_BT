import { addKeyword } from '@builderbot/bot'
import type { BaileysProvider } from '@builderbot/provider-baileys'
import { searchBible } from '../modules/busca/bibleSearch'

export const buscaFlow = addKeyword<BaileysProvider>(['buscar', 'bíblia fala', 'versículo sobre', '5'])
  .addAnswer(
    '*Busca Bíblica*\n\nSobre qual tema quer buscar?\n\n_Ex: ansiedade, amor, perdão..._',
    { capture: true },
    async (ctx, { flowDynamic }) => {
      await flowDynamic('Buscando na Palavra...')

      const result = await searchBible(ctx.body)
      await flowDynamic(result)
    }
  )
