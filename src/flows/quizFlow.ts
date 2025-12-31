import { addKeyword } from '@builderbot/bot'
import type { BaileysProvider } from '@builderbot/provider-baileys'
import { startQuiz, checkAnswer, hasActiveQuiz, endQuiz } from '../modules/quiz/quizManager'

export const quizFlow = addKeyword<BaileysProvider>(['quiz', 'jogar', 'jogo', '2'])
  .addAction(async (ctx, { flowDynamic }) => {
    if (hasActiveQuiz(ctx.from)) {
      await flowDynamic('Voce ja tem um quiz ativo! Responda ou digite "sair".')
      return
    }

    await flowDynamic('*Quiz Biblico!* Vamos testar seu conhecimento. 5 perguntas!')

    const question = await startQuiz(ctx.from)
    await flowDynamic(question)
  })

export const quizAnswerFlow = addKeyword<BaileysProvider>(['a', 'b', 'c', 'd'])
  .addAction(async (ctx, { flowDynamic }) => {
    if (!hasActiveQuiz(ctx.from)) return

    try {
      const result = await checkAnswer(ctx.from, ctx.body)

      if (result.correct) {
        await flowDynamic(`*Correto!* +${result.points} pts\n\n${result.explanation}`)
      } else {
        await flowDynamic(`*Errou!*\n\n${result.explanation}`)
      }

      if (result.finished) {
        await flowDynamic(`\n*Quiz Finalizado!* Total: ${result.totalPoints} pontos\n\nDigite "quiz" para jogar de novo!`)
      } else if (result.nextQuestion) {
        await flowDynamic(result.nextQuestion)
      }
    } catch {
      await flowDynamic('Responda com A, B, C ou D.')
    }
  })

export const quizExitFlow = addKeyword<BaileysProvider>(['sair', 'parar'])
  .addAction(async (ctx, { flowDynamic }) => {
    if (hasActiveQuiz(ctx.from)) {
      const points = endQuiz(ctx.from)
      await flowDynamic(`Quiz encerrado! Voce fez ${points} pontos.`)
    }
  })
