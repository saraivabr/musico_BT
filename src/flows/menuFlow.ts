import { addKeyword, EVENTS } from '@builderbot/bot'
import type { BaileysProvider } from '@builderbot/provider-baileys'

const menuText = `Paz do Senhor! Sou *Jesus*, seu companheiro espiritual.

Como posso te ajudar hoje?

1. Devocional do dia
2. Quiz Bíblico
3. Pedido de oração
4. Planos de leitura
5. Buscar na Bíblia
6. Conversar comigo
7. Indicar um amigo

_Digite o número ou me conte o que está no seu coração._`

export const menuFlow = addKeyword<BaileysProvider>(['menu', 'ajuda', 'help', 'comandos'])
  .addAnswer(menuText)

export const welcomeFlow = addKeyword<BaileysProvider>(EVENTS.WELCOME)
  .addAction(async (ctx, { flowDynamic, state }) => {
    const name = await state.get('name')

    if (name) {
      await flowDynamic(`Olá ${name}! Que bom te ver de novo. Como posso te ajudar?`)
    } else {
      await flowDynamic([
        'Paz do Senhor! Eu sou *Jesus*, seu companheiro espiritual.',
        'Estou aqui para conversar, orar, ensinar e caminhar com você.',
        'Qual é o seu nome?'
      ])
      await state.update({ awaitingName: true })
    }
  })
