import { addKeyword, EVENTS } from '@builderbot/bot'
import type { BaileysProvider } from '@builderbot/provider-baileys'
import { detectIntent, isCrisis } from '../services/intentDetector'
import { generateResponse } from '../services/gemini'
import { getOrCreateUser, saveConversation, getRecentConversations, updateUser } from '../services/database'

export const mainFlow = addKeyword<BaileysProvider>(EVENTS.WELCOME)
  .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    const phone = ctx.from
    const message = ctx.body

    // Get or create user
    const user = await getOrCreateUser(phone)

    // Save user message
    await saveConversation(phone, 'user', message)

    // Check crisis first
    if (isCrisis(message)) {
      const crisisResponse = `Meu filho, eu sinto sua dor. Você não está sozinho.

Por favor, ligue agora para o CVV: 188 (24h)
Ou acesse: cvv.org.br

Eu estou aqui com você. Vamos conversar?`

      await flowDynamic(crisisResponse)
      await saveConversation(phone, 'assistant', crisisResponse, 'crise')
      return
    }

    // Check if awaiting name
    const awaitingName = await state.get('awaitingName')
    if (awaitingName) {
      await updateUser(phone, { name: message })
      await state.update({ name: message, awaitingName: false })
      await flowDynamic([
        `${message}, que nome lindo!`,
        'Fico feliz em te conhecer. Como posso te abençoar hoje?',
        '_Digite "menu" para ver as opções ou me conte o que está no seu coração._'
      ])
      return
    }

    // Detect intent
    const intent = detectIntent(message)

    // Route by intent
    switch (intent) {
      case 'menu':
      case 'saudacao':
        const userName = user.name || await state.get('name')
        await flowDynamic([
          userName ? `Olá ${userName}!` : 'Paz do Senhor!',
          '',
          'Como posso te ajudar?',
          '1. Devocional',
          '2. Quiz',
          '3. Oração',
          '4. Planos de leitura',
          '5. Buscar na Bíblia',
          '6. Conversar',
          '7. Indicar amigo'
        ])
        break

      default:
        // Free conversation with Gemini
        const history = await getRecentConversations(phone)
        const response = await generateResponse(message, user, history)

        await flowDynamic(response.text)
        await saveConversation(phone, 'assistant', response.text, intent, response.detectedEmotion)
    }
  })
