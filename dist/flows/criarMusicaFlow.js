"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarMusicaConversationFlow = exports.criarMusicaFlow = void 0;
const bot_1 = require("@builderbot/bot");
const uuid_1 = require("uuid");
const database_1 = require("../services/database");
const sunoApi_1 = require("../services/sunoApi");
const gemini_1 = require("../services/gemini");
const transcription_1 = require("../services/transcription");
const conversationAnalysis_1 = require("../services/conversationAnalysis");
const user_1 = require("../types/user");
// Flow conversacional para criar música
exports.criarMusicaFlow = (0, bot_1.addKeyword)([
    'criar',
    'musica',
    'música',
    'nova',
    '1',
    'compor',
    'canção'
])
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    const phone = ctx.from;
    const user = await (0, database_1.getOrCreateUser)(phone);
    if (user.credits < 1) {
        await flowDynamic([
            `❌ *Você não tem créditos!*\n\nCada música custa *1 crédito*.\n\n💰 Digite *comprar* para adquirir créditos.`
        ]);
        return;
    }
    // Inicializar contexto de conversa
    await state.update({
        creatingMusic: true,
        musicState: {
            conversationHistory: [],
            description: undefined,
            lyrics: undefined,
            style: undefined
        }
    });
    await flowDynamic([
        `🎵 *Opa, vamos criar uma música!*\n\nMe conta tudo: qual a vibe? O que você imagina? Pode ser um sentimento, uma história, uma festa... o que for! 🎤`
    ]);
});
// Flow conversacional contínuo
exports.criarMusicaConversationFlow = (0, bot_1.addKeyword)(bot_1.EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, endFlow, provider }) => {
    const currentState = await state.getMyState();
    // Se não está criando música, ignora
    if (!currentState?.creatingMusic)
        return;
    const phone = ctx.from;
    const musicState = currentState.musicState || {
        conversationHistory: [],
        description: undefined,
        lyrics: undefined,
        style: undefined
    };
    let userMessage = ctx.body.trim();
    // Se for áudio, transcrever
    if ((0, transcription_1.isAudioMessage)(ctx.message)) {
        try {
            await flowDynamic(['🎤 *Estou ouvindo...*']);
            userMessage = await (0, transcription_1.processAudioMessage)(ctx.message.media.url);
            console.log(`[AUDIO] Transcrição: ${userMessage}`);
        }
        catch (error) {
            await flowDynamic([
                `❌ Não consegui entender o áudio.\n\nTenta descrever em texto ou manda outro áudio?`
            ]);
            return;
        }
    }
    // Cancelar se disse "cancelar", "sair", etc
    if (userMessage.toLowerCase().includes('cancelar') ||
        userMessage.toLowerCase().includes('sair') ||
        userMessage.toLowerCase().includes('voltar')) {
        await state.update({ creatingMusic: false, musicState: {} });
        await flowDynamic(['❌ Criação cancelada. Digite *criar* para começar novamente.']);
        return endFlow();
    }
    // Adicionar mensagem do usuário ao histórico
    musicState.conversationHistory.push({
        role: 'user',
        content: userMessage
    });
    // Analisar intenção com GPT
    const context = await (0, conversationAnalysis_1.analyzeUserMessage)(userMessage, musicState.conversationHistory);
    // Atualizar estado com informações extraídas
    if (context.description)
        musicState.description = context.description;
    if (context.lyrics)
        musicState.lyrics = context.lyrics;
    if (context.style)
        musicState.style = context.style;
    // Gerar resposta conversacional
    const botResponse = await (0, conversationAnalysis_1.generateBotResponse)(userMessage, context, musicState.conversationHistory);
    // Adicionar resposta do bot ao histórico
    musicState.conversationHistory.push({
        role: 'assistant',
        content: botResponse
    });
    // Salvar estado
    await state.update({
        creatingMusic: !context.readyToGenerate,
        musicState
    });
    // Enviar resposta
    await flowDynamic([botResponse]);
    // Se pronto, gerar música
    if (context.readyToGenerate) {
        await generateMusicFromContext(phone, musicState, provider, state, flowDynamic);
    }
});
// Função para gerar música a partir do contexto
async function generateMusicFromContext(phone, musicState, provider, state, flowDynamic) {
    const musicId = (0, uuid_1.v4)();
    // Debitar crédito
    const debited = await (0, database_1.deductCredit)(phone);
    if (!debited) {
        await flowDynamic([
            '❌ *Ops!* Créditos insuficientes.\n\n💰 Digite *comprar* para adquirir mais.'
        ]);
        await state.update({ creatingMusic: false, musicState: {} });
        return;
    }
    await flowDynamic([
        `✨ *Deixa eu criar isso pra você...*\n\nIsso pode levar alguns minutos. Já venho! 🎵`
    ]);
    await state.update({ creatingMusic: false, musicState: {} });
    // Gerar em background
    generateMusicAsync(phone, musicId, musicState, provider);
}
// Função para gerar música em background
async function generateMusicAsync(phone, musicId, musicState, provider) {
    try {
        let prompt;
        let generatedLyrics;
        // Se é descrição, gerar letra primeiro
        if (!musicState.lyrics) {
            console.log(`[MUSIC] Gerando letra para ${phone}...`);
            const lyrics = await (0, gemini_1.generateLyrics)(musicState.description || '', musicState.style || 'pop');
            prompt = lyrics;
            generatedLyrics = lyrics;
        }
        else {
            prompt = musicState.lyrics;
        }
        // Encontrar estilo correspondente
        let styleObj = user_1.MUSIC_STYLES.find(s => s.id === musicState.style) ||
            user_1.MUSIC_STYLES[0];
        // Gerar música no Suno
        console.log(`[MUSIC] Enviando para Suno API...`);
        const taskId = await (0, sunoApi_1.generateMusic)(prompt, musicState.style || 'pop', !!musicState.lyrics);
        // Salvar no banco como "generating"
        const music = {
            id: musicId,
            prompt: musicState.lyrics || musicState.description || '',
            style: musicState.style || 'pop',
            isCustomLyrics: !!musicState.lyrics,
            generatedLyrics,
            status: 'generating',
            sunoTaskId: taskId,
            createdAt: new Date()
        };
        await (0, database_1.addMusic)(phone, music);
        // Aguardar conclusão
        console.log(`[MUSIC] Aguardando conclusão...`);
        const result = await (0, sunoApi_1.waitForCompletion)(taskId);
        if (result.status === 'completed' && result.songs && result.songs.length > 0) {
            const song = result.songs[0];
            // Atualizar no banco
            await (0, database_1.updateMusicStatus)(phone, musicId, {
                status: 'ready',
                audioUrl: song.audioUrl,
                videoUrl: song.videoUrl,
                downloadUrl: song.audioUrl,
                title: song.title,
                completedAt: new Date()
            });
            // Enviar para o usuário
            await provider.sendMessage(phone, `🎉 *Pronto! Sua música está aqui!*\n\n🎵 *${song.title || 'Sua Música'}*`, {});
            // Enviar áudio
            if (song.audioUrl) {
                await provider.sendMessage(phone, '🎵 Ouça:', {
                    media: song.audioUrl
                });
            }
            // Enviar link e vídeo
            await provider.sendMessage(phone, `🔗 *Download:* ${song.audioUrl}\n\n${song.videoUrl ? `🎬 *Vídeo com letra:* ${song.videoUrl}\n\n` : ''}Quer criar mais? Manda *criar* aí! 🎶`, {});
            console.log(`[MUSIC] Música ${musicId} entregue para ${phone}`);
        }
        else {
            throw new Error('Geração falhou');
        }
    }
    catch (error) {
        console.error(`[MUSIC] Erro ao gerar música para ${phone}:`, error);
        await (0, database_1.updateMusicStatus)(phone, musicId, {
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date()
        });
        await provider.sendMessage(phone, `❌ *Ops! Algo deu errado.*\n\nSeu crédito foi devolvido. Tenta novamente? 🎤`, {});
    }
}
//# sourceMappingURL=criarMusicaFlow.js.map