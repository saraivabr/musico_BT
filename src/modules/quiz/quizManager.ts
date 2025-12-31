import { User } from '../../services/database'
import { getRandomQuestion, Question } from './questions'

interface QuizSession {
  currentQuestion: Question
  answeredIds: string[]
  sessionPoints: number
  questionsAnswered: number
}

const activeSessions = new Map<string, QuizSession>()

export function formatQuestion(question: Question): string {
  const options = question.options
    .map((opt, i) => `${['A', 'B', 'C', 'D'][i]}. ${opt}`)
    .join('\n')

  return [
    `*Quiz Bíblico* (${question.points} pts)`,
    '',
    question.question,
    '',
    options,
    '',
    '_Responda com A, B, C ou D_'
  ].join('\n')
}

export async function startQuiz(phone: string): Promise<string> {
  const question = getRandomQuestion()
  if (!question) throw new Error('Sem perguntas')

  activeSessions.set(phone, {
    currentQuestion: question,
    answeredIds: [question.id],
    sessionPoints: 0,
    questionsAnswered: 0
  })

  return formatQuestion(question)
}

export async function checkAnswer(phone: string, answer: string): Promise<{
  correct: boolean
  explanation: string
  points: number
  totalPoints: number
  nextQuestion?: string
  finished: boolean
}> {
  const session = activeSessions.get(phone)
  if (!session) throw new Error('Nenhum quiz ativo')

  const letterIndex = ['a', 'b', 'c', 'd'].indexOf(answer.toLowerCase().trim())
  if (letterIndex === -1) throw new Error('Resposta inválida')

  const correct = letterIndex === session.currentQuestion.correctIndex
  const points = correct ? session.currentQuestion.points : 0

  session.sessionPoints += points
  session.questionsAnswered++

  // Update user stats
  await User.findOneAndUpdate(
    { phone },
    {
      $inc: {
        'quizStats.totalPoints': points,
        'quizStats.gamesPlayed': 1,
        'quizStats.correctAnswers': correct ? 1 : 0
      }
    }
  )

  // Check if finished (5 questions max)
  if (session.questionsAnswered >= 5) {
    activeSessions.delete(phone)
    return {
      correct,
      explanation: session.currentQuestion.explanation,
      points,
      totalPoints: session.sessionPoints,
      finished: true
    }
  }

  // Next question
  const next = getRandomQuestion(session.answeredIds)
  if (next) {
    session.currentQuestion = next
    session.answeredIds.push(next.id)
    return {
      correct,
      explanation: session.currentQuestion.explanation,
      points,
      totalPoints: session.sessionPoints,
      nextQuestion: formatQuestion(next),
      finished: false
    }
  }

  activeSessions.delete(phone)
  return {
    correct,
    explanation: session.currentQuestion.explanation,
    points,
    totalPoints: session.sessionPoints,
    finished: true
  }
}

export function hasActiveQuiz(phone: string): boolean {
  return activeSessions.has(phone)
}

export function endQuiz(phone: string): number {
  const session = activeSessions.get(phone)
  const points = session?.sessionPoints || 0
  activeSessions.delete(phone)
  return points
}
