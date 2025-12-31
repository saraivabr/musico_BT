import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../../config'

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

export async function searchBible(query: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Você é um especialista em Bíblia. Pergunta: "${query}"

Responda com:
1. 2-3 versículos relevantes (com referência)
2. Breve explicação
3. Reflexão prática

Use markdown. Seja conciso. Tom acolhedor.`

  try {
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch {
    return 'Não consegui buscar agora. Tenta de novo?'
  }
}

export async function explainVerse(verse: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Explique "${verse}" de forma simples:
1. Contexto histórico (breve)
2. Significado
3. Aplicação hoje

Máximo 3 parágrafos. Tom pastoral.`

  try {
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch {
    return 'Não consegui explicar agora. Tenta de novo?'
  }
}
