import { addKeyword, EVENTS } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { v4 as uuidv4 } from 'uuid'
import { getOrCreateUser, deductCredit, addMusic, updateMusicStatus } from '../services/database'
import { generateMusic, waitForCompletion } from '../services/sunoApi'
import { generateLyrics } from '../services/gemini'
import { processAudioMessage, isAudioMessage } from '../services/transcription'
import { analyzeUserMessage, generateBotResponse } from '../services/conversationAnalysis'
import { MUSIC_STYLES } from '../types/user'
import type { IMusic } from '../types/user'

interface MusicCreationState {
  conversationHistory: Array<{ role: string; content: string }>
  description?: string
  lyrics?: string
  style?: string
}

// Flow conversacional para criar música
export const criarMusicaFlow = addKeyword<BaileysProvider>([
  'criar',
  'musica',
  'música',
  'nova',
  '1',
  'compor',
  'canção'
])
  .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    const phone = ctx.from
    const user = await getOrCreateUser(phone)

    if (user.credits < 1) {
      await flowDynamic([
        `❌ *Você não tem créditos!*\n\nCada música custa *1 crédito*.\n\n💰 Digite *comprar* para adquirir créditos.`
      ])
      return
    }

    // Inicializar contexto de conversa
    await state.update({
      creatingMusic: true,
      musicState: {
        conversationHistory: [],
        description: undefined,
        lyrics: undefined,
        style: undefined
      } as MusicCreationState
    })

    await flowDynamic([
      `🎵 *Opa, vamos criar uma música!*\n\nMe conta tudo: qual a vibe? O que você imagina? Pode ser um sentimento, uma história, uma festa... o que for! 🎤`
    ])
  })

// Flow conversacional contínuo
export const criarMusicaConversationFlow = addKeyword<BaileysProvider>(EVENTS.ACTION)
  .addAction(async (ctx, { flowDynamic, state, endFlow, provider }) => {
    const currentState = await state.getMyState()

    // Se não está criando música, ignora
    if (!currentState?.creatingMusic) return

    const phone = ctx.from
    const musicState: MusicCreationState = currentState.musicState || {
      conversationHistory: [],
      description: undefined,
      lyrics: undefined,
      style: undefined
    }

    let userMessage = ctx.body.trim()

    // Se for áudio, transcrever
    if (isAudioMessage(ctx.message)) {
      try {
        await flowDynamic(['🎤 *Estou ouvindo...*'])
        userMessage = await processAudioMessage(ctx.message.media.url)
        console.log(`[AUDIO] Transcrição: ${userMessage}`)
      } catch (error: any) {
        await flowDynamic([
          `❌ Não consegui entender o áudio.\n\nTenta descrever em texto ou manda outro áudio?`
        ])
        return
      }
    }

    // Cancelar se disse "cancelar", "sair", etc
    if (
      userMessage.toLowerCase().includes('cancelar') ||
      userMessage.toLowerCase().includes('sair') ||
      userMessage.toLowerCase().includes('voltar')
    ) {
      await state.update({ creatingMusic: false, musicState: {} })
      await flowDynamic(['❌ Criação cancelada. Digite *criar* para começar novamente.'])
      return endFlow()
    }

    // Adicionar mensagem do usuário ao histórico
    musicState.conversationHistory.push({
      role: 'user',
      content: userMessage
    })

    // Analisar intenção com GPT
    const context = await analyzeUserMessage(
      userMessage,
      musicState.conversationHistory
    )

    // Atualizar estado com informações extraídas
    if (context.description) musicState.description = context.description
    if (context.lyrics) musicState.lyrics = context.lyrics
    if (context.style) musicState.style = context.style

    // Gerar resposta conversacional
    const botResponse = await generateBotResponse(
      userMessage,
      context,
      musicState.conversationHistory
    )

    // Adicionar resposta do bot ao histórico
    musicState.conversationHistory.push({
      role: 'assistant',
      content: botResponse
    })

    // Salvar estado
    await state.update({
      creatingMusic: !context.readyToGenerate,
      musicState
    })

    // Enviar resposta
    await flowDynamic([botResponse])

    // Se pronto, gerar música
    if (context.readyToGenerate) {
      await generateMusicFromContext(
        phone,
        musicState,
        provider,
        state,
        flowDynamic
      )
    }
  })

// Função para gerar música a partir do contexto
async function generateMusicFromContext(
  phone: string,
  musicState: MusicCreationState,
  provider: BaileysProvider,
  state: any,
  flowDynamic: any
) {
  const musicId = uuidv4()

  // Debitar crédito
  const debited = await deductCredit(phone)
  if (!debited) {
    await flowDynamic([
      '❌ *Ops!* Créditos insuficientes.\n\n💰 Digite *comprar* para adquirir mais.'
    ])
    await state.update({ creatingMusic: false, musicState: {} })
    return
  }

  await flowDynamic([
    `✨ *Deixa eu criar isso pra você...*\n\nIsso pode levar alguns minutos. Já venho! 🎵`
  ])

  await state.update({ creatingMusic: false, musicState: {} })

  // Gerar em background
  generateMusicAsync(phone, musicId, musicState, provider)
}

// Função para gerar música em background
async function generateMusicAsync(
  phone: string,
  musicId: string,
  musicState: MusicCreationState,
  provider: BaileysProvider
) {
  try {
    let prompt: string
    let generatedLyrics: string | undefined

    // Se é descrição, gerar letra primeiro
    if (!musicState.lyrics) {
      console.log(`[MUSIC] Gerando letra para ${phone}...`)
      const lyrics = await generateLyrics(
        musicState.description || '',
        musicState.style || 'pop'
      )
      prompt = lyrics
      generatedLyrics = lyrics
    } else {
      prompt = musicState.lyrics
    }

    // Encontrar estilo correspondente
    let styleObj = MUSIC_STYLES.find(s => s.id === musicState.style) ||
      MUSIC_STYLES[0]

    // Gerar música no Suno
    console.log(`[MUSIC] Enviando para Suno API...`)
    const taskId = await generateMusic(
      prompt,
      musicState.style || 'pop',
      !!musicState.lyrics
    )

    // Salvar no banco como "generating"
    const music: IMusic = {
      id: musicId,
      prompt: musicState.lyrics || musicState.description || '',
      style: musicState.style || 'pop',
      isCustomLyrics: !!musicState.lyrics,
      generatedLyrics,
      status: 'generating',
      sunoTaskId: taskId,
      createdAt: new Date()
    }

    await addMusic(phone, music)

    // Aguardar conclusão
    console.log(`[MUSIC] Aguardando conclusão...`)
    const result = await waitForCompletion(taskId)

    if (result.status === 'completed' && result.songs && result.songs.length > 0) {
      const song = result.songs[0]

      // Atualizar no banco
      await updateMusicStatus(phone, musicId, {
        status: 'ready',
        audioUrl: song.audioUrl,
        videoUrl: song.videoUrl,
        downloadUrl: song.audioUrl,
        title: song.title,
        completedAt: new Date()
      })

      // Enviar para o usuário
      await provider.sendMessage(
        phone,
        `🎉 *Pronto! Sua música está aqui!*\n\n🎵 *${song.title || 'Sua Música'}*`,
        {}
      )

      // Enviar áudio
      if (song.audioUrl) {
        await provider.sendMessage(phone, '🎵 Ouça:', {
          media: song.audioUrl
        })
      }

      // Enviar link e vídeo
      await provider.sendMessage(
        phone,
        `🔗 *Download:* ${song.audioUrl}\n\n${song.videoUrl ? `🎬 *Vídeo com letra:* ${song.videoUrl}\n\n` : ''}Quer criar mais? Manda *criar* aí! 🎶`,
        {}
      )

      console.log(`[MUSIC] Música ${musicId} entregue para ${phone}`)
    } else {
      throw new Error('Geração falhou')
    }
  } catch (error: any) {
    console.error(`[MUSIC] Erro ao gerar música para ${phone}:`, error)

    await updateMusicStatus(phone, musicId, {
      status: 'failed',
      errorMessage: error.message,
      completedAt: new Date()
    })

    await provider.sendMessage(
      phone,
      `❌ *Ops! Algo deu errado.*\n\nSeu crédito foi devolvido. Tenta novamente? 🎤`,
      {}
    )
  }
}
