import OpenAI from 'openai'
import { config } from '../config'

const openai = new OpenAI({
  apiKey: config.openai.apiKey
})

const LYRICS_SYSTEM_PROMPT = `Você é um compositor de músicas brasileiro talentoso. Crie letras criativas, emocionantes e que combinem com o estilo solicitado. Escreva em português brasileiro.

REGRAS:
- Crie letras originais e autênticas
- Estruture com versos, refrão e ponte (bridge) quando apropriado
- Use rimas naturais, não forçadas
- Capture a emoção e o tema solicitado
- Adapte o vocabulário e ritmo ao estilo musical
- Inclua indicações de estrutura (Verso 1, Refrão, etc.)
- Mantenha coerência temática ao longo da música`

const ENHANCE_SYSTEM_PROMPT = `Você é um compositor e letrista brasileiro experiente. Seu trabalho é melhorar letras de músicas existentes, mantendo a essência original mas elevando a qualidade.

SUAS HABILIDADES:
- Melhorar rimas e métricas
- Fortalecer imagens e metáforas
- Ajustar vocabulário para o estilo musical
- Tornar a letra mais fluida e cantável
- Adicionar profundidade emocional
- Sugerir melhorias estruturais

REGRAS:
- Preserve a mensagem e tema central
- Mantenha partes que já funcionam bem
- Explique brevemente as principais mudanças
- Adapte ao estilo musical indicado`

export interface LyricsResponse {
  lyrics: string
  style: string
}

export interface EnhanceResponse {
  enhancedLyrics: string
  changes: string
}

/**
 * Gera letras de música com base na descrição e estilo fornecidos
 * @param description - Tema, humor, propósito da música
 * @param style - Estilo musical (pop, rock, sertanejo, MPB, etc.)
 * @returns Letra completa com versos, refrão e ponte
 */
export async function generateLyrics(description: string, style: string): Promise<string> {
  const prompt = `ESTILO MUSICAL: ${style}

DESCRIÇÃO/TEMA: ${description}

Crie uma letra de música completa com:
- Pelo menos 2 versos
- Um refrão marcante
- Uma ponte (bridge) opcional
- Indicações claras de estrutura

A letra deve capturar a essência do tema e se encaixar perfeitamente no estilo ${style}.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: LYRICS_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.9
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('[OpenAI] Erro ao gerar letra:', error)
    throw new Error('Não foi possível gerar a letra. Tente novamente.')
  }
}

/**
 * Melhora/aprimora letras fornecidas pelo usuário
 * @param lyrics - Letra original do usuário
 * @param style - Estilo musical desejado
 * @returns Letra aprimorada com explicação das mudanças
 */
export async function enhanceLyrics(lyrics: string, style: string): Promise<string> {
  const prompt = `ESTILO MUSICAL: ${style}

LETRA ORIGINAL:
${lyrics}

Por favor:
1. Apresente a letra melhorada com a estrutura clara (Verso, Refrão, etc.)
2. Ao final, adicione uma seção "MUDANÇAS REALIZADAS:" explicando as principais melhorias

Mantenha a essência e mensagem original, mas eleve a qualidade da letra para o estilo ${style}.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ENHANCE_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.85
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('[OpenAI] Erro ao melhorar letra:', error)
    throw new Error('Não foi possível melhorar a letra. Tente novamente.')
  }
}

/**
 * Gera sugestões de temas para músicas baseado em um contexto
 * @param context - Contexto ou inspiração para sugestões
 * @returns Lista de sugestões de temas
 */
export async function suggestThemes(context: string): Promise<string[]> {
  const prompt = `Com base no seguinte contexto, sugira 5 temas interessantes para músicas:

CONTEXTO: ${context}

Retorne APENAS um JSON array com 5 strings, cada uma sendo uma breve descrição do tema sugerido.
Exemplo: ["Amor de verão na praia", "Saudade de casa", ...]`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um compositor criativo brasileiro. Retorne apenas JSON válido.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.9
    })

    const text = response.choices[0]?.message?.content || '[]'
    const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(cleanJson)
  } catch (error) {
    console.error('[OpenAI] Erro ao sugerir temas:', error)
    return [
      'Amor à primeira vista',
      'Saudade de tempos melhores',
      'Superação pessoal',
      'Festa com amigos',
      'Reflexão sobre a vida'
    ]
  }
}

/**
 * Analisa uma letra e fornece feedback construtivo
 * @param lyrics - Letra para análise
 * @returns Feedback detalhado sobre a letra
 */
export async function analyzeLyrics(lyrics: string): Promise<string> {
  const prompt = `Analise a seguinte letra de música e forneça feedback construtivo:

LETRA:
${lyrics}

Forneça uma análise breve cobrindo:
1. Pontos fortes da letra
2. Oportunidades de melhoria
3. Sugestões específicas
4. Avaliação geral (1-10)

Seja construtivo e encorajador, mas honesto.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um crítico musical e letrista experiente.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.7
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('[OpenAI] Erro ao analisar letra:', error)
    throw new Error('Não foi possível analisar a letra. Tente novamente.')
  }
}
