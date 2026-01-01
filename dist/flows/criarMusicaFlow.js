"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarMusicaActionFlow = exports.criarMusicaFlow = void 0;
const bot_1 = require("@builderbot/bot");
const uuid_1 = require("uuid");
const database_1 = require("../services/database");
const sunoApi_1 = require("../services/sunoApi");
const gemini_1 = require("../services/gemini");
const transcription_1 = require("../services/transcription");
const user_1 = require("../types/user");
// Formatar lista de estilos
function formatStyles() {
    return user_1.MUSIC_STYLES.map((s, i) => `${i + 1}️⃣ ${s.emoji} ${s.name}`).join('\n');
}
function getStyleById(index) {
    return user_1.MUSIC_STYLES[index - 1];
}
function getStyleByName(name) {
    const lower = name.toLowerCase();
    return user_1.MUSIC_STYLES.find(s => s.name.toLowerCase().includes(lower) ||
        s.id.toLowerCase().includes(lower));
}
// Flow principal para criar música
exports.criarMusicaFlow = (0, bot_1.addKeyword)(['criar', 'musica', 'música', 'nova', '1'])
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    const phone = ctx.from;
    const user = await (0, database_1.getOrCreateUser)(phone);
    const credits = user.credits;
    if (credits < 1) {
        await flowDynamic([
            `❌ *Você não tem créditos!*\n\nCada música custa *1 crédito*.\n\n💰 Digite *comprar* para adquirir créditos.`
        ]);
        return;
    }
    await flowDynamic([
        `🎵 *Criar Música*\n\nVocê tem *${credits}* crédito${credits !== 1 ? 's' : ''}.\n\n*Como você quer criar?*`,
        `1️⃣ *Descrever* - Você fala (áudio 🎤) ou escreve a ideia`,
        `2️⃣ *Enviar letra* - Você envia a letra pronta e eu faço a música`,
        `\nDigite *1* ou *2*:`
    ]);
    await state.update({
        musicCreationStep: 'choosing_mode',
        musicData: {}
    });
});
// Flow para processar escolhas durante criação
exports.criarMusicaActionFlow = (0, bot_1.addKeyword)(bot_1.EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, endFlow, provider }) => {
    const currentState = await state.getMyState();
    const step = currentState?.musicCreationStep;
    const phone = ctx.from;
    const input = ctx.body.trim();
    if (!step)
        return;
    // Passo 1: Escolher modo (descrição ou letra pronta)
    if (step === 'choosing_mode') {
        if (input === '1') {
            await state.update({
                musicCreationStep: 'getting_description',
                musicData: { isCustomLyrics: false }
            });
            await flowDynamic([
                `✍️ *Descreva sua música*\n\nMe conte:\n- Qual o tema ou história?\n- Pra quem é? (presente, homenagem, etc)\n- Qual o clima? (alegre, romântico, animado...)\n\n_Exemplo: "Uma música de aniversário pro meu filho de 5 anos, alegre e divertida"_`
            ]);
        }
        else if (input === '2') {
            await state.update({
                musicCreationStep: 'getting_lyrics',
                musicData: { isCustomLyrics: true }
            });
            await flowDynamic([
                `📝 *Envie sua letra*\n\nCole ou digite a letra completa da música.\n\n_Dica: Pode ter versos, refrão, ponte... Quanto mais detalhes, melhor!_`
            ]);
        }
        else {
            await flowDynamic('Digite *1* para descrever ou *2* para enviar letra pronta.');
        }
        return;
    }
    // Passo 2a: Receber descrição (áudio ou texto)
    if (step === 'getting_description') {
        let description = input;
        // Se for áudio, transcrever
        if ((0, transcription_1.isAudioMessage)(ctx.message)) {
            try {
                await flowDynamic(['🎤 *Estou escutando sua visão...*']);
                const mediaUrl = ctx.message.media.url;
                description = await (0, transcription_1.processAudioMessage)(mediaUrl);
                console.log(`[AUDIO] Transcrição: ${description}`);
                await flowDynamic([`✅ *Entendi:* "${description}")`]);
            }
            catch (error) {
                console.error('[AUDIO] Erro ao transcrever:', error);
                await flowDynamic([
                    `❌ ${error.message || 'Não consegui entender o áudio.'}\n\nTenta descrever em texto ou manda outro áudio?`
                ]);
                return;
            }
        }
        await state.update({
            musicCreationStep: 'choosing_style',
            musicData: {
                ...currentState.musicData,
                description
            }
        });
        await flowDynamic([
            `🎸 *Qual estilo musical?*\n\n${formatStyles()}\n\nDigite o *número* ou o *nome* do estilo:`
        ]);
        return;
    }
    // Passo 2b: Receber letra pronta
    if (step === 'getting_lyrics') {
        if (input.length < 50) {
            await flowDynamic('❌ A letra parece muito curta. Envie pelo menos uma estrofe completa.');
            return;
        }
        await state.update({
            musicCreationStep: 'choosing_style',
            musicData: {
                ...currentState.musicData,
                lyrics: input
            }
        });
        await flowDynamic([
            `🎸 *Qual estilo musical?*\n\n${formatStyles()}\n\nDigite o *número* ou o *nome* do estilo:`
        ]);
        return;
    }
    // Passo 3: Escolher estilo
    if (step === 'choosing_style') {
        let style = getStyleById(parseInt(input)) || getStyleByName(input);
        if (!style) {
            await flowDynamic(`❌ Estilo não encontrado. Digite um número de 1 a ${user_1.MUSIC_STYLES.length} ou o nome do estilo.`);
            return;
        }
        const musicData = {
            ...currentState.musicData,
            style: style
        };
        await state.update({
            musicCreationStep: 'confirming',
            musicData
        });
        const preview = musicData.isCustomLyrics
            ? `📝 Letra: _${musicData.lyrics?.substring(0, 100)}..._`
            : `💭 Descrição: _${musicData.description}_`;
        await flowDynamic([
            `✅ *Confirma a criação?*\n\n${preview}\n🎸 Estilo: *${style.emoji} ${style.name}*\n💰 Custo: *1 crédito*\n\nDigite *sim* para confirmar ou *não* para cancelar.`
        ]);
        return;
    }
    // Passo 4: Confirmar e gerar
    if (step === 'confirming') {
        const lower = input.toLowerCase();
        if (lower === 'não' || lower === 'nao' || lower === 'cancelar') {
            await state.update({ musicCreationStep: null, musicData: {} });
            await flowDynamic('❌ Criação cancelada. Digite *criar* para começar novamente.');
            return endFlow();
        }
        if (lower !== 'sim' && lower !== 's' && lower !== 'confirmar') {
            await flowDynamic('Digite *sim* para confirmar ou *não* para cancelar.');
            return;
        }
        // Debitar crédito
        const debited = await (0, database_1.deductCredit)(phone);
        if (!debited) {
            await flowDynamic('❌ Créditos insuficientes. Digite *comprar* para adquirir mais.');
            await state.update({ musicCreationStep: null, musicData: {} });
            return endFlow();
        }
        const musicData = currentState.musicData;
        const musicId = (0, uuid_1.v4)();
        await flowDynamic([
            `⏳ *Gerando sua música...*\n\nIsso pode levar de 2 a 4 minutos.\nVou te avisar quando ficar pronta! 🎵`
        ]);
        await state.update({ musicCreationStep: null, musicData: {} });
        // Gerar música em background
        generateMusicAsync(phone, musicId, musicData, provider);
        return endFlow();
    }
});
// Função para gerar música em background
async function generateMusicAsync(phone, musicId, musicData, provider) {
    try {
        let prompt;
        let generatedLyrics;
        // Se é descrição, gerar letra primeiro
        if (!musicData.isCustomLyrics) {
            console.log(`[MUSIC] Gerando letra para ${phone}...`);
            const lyrics = await (0, gemini_1.generateLyrics)(musicData.description, musicData.style.name);
            prompt = lyrics;
            generatedLyrics = lyrics;
        }
        else {
            prompt = musicData.lyrics;
        }
        // Gerar música no Suno
        console.log(`[MUSIC] Enviando para Suno API...`);
        const taskId = await (0, sunoApi_1.generateMusic)(prompt, musicData.style.name, musicData.isCustomLyrics);
        // Salvar música no banco como "generating"
        const music = {
            id: musicId,
            prompt: musicData.isCustomLyrics ? musicData.lyrics : musicData.description,
            style: musicData.style.id,
            isCustomLyrics: musicData.isCustomLyrics,
            generatedLyrics,
            status: 'generating',
            sunoTaskId: taskId,
            createdAt: new Date()
        };
        await (0, database_1.addMusic)(phone, music);
        // Aguardar conclusão (polling)
        console.log(`[MUSIC] Aguardando conclusão do taskId ${taskId}...`);
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
            await provider.sendMessage(phone, `🎉 *Sua música ficou pronta!*\n\n🎵 *${song.title || 'Sua Música'}*\n\n📥 Ouça agora:`, {});
            // Enviar áudio
            if (song.audioUrl) {
                await provider.sendMessage(phone, '🎵 Sua música:', { media: song.audioUrl });
            }
            // Enviar link
            await provider.sendMessage(phone, `🔗 *Link para download:*\n${song.audioUrl}\n\n${song.videoUrl ? `🎬 *Vídeo com letra:*\n${song.videoUrl}\n\n` : ''}Gostou? Digite *criar* para fazer mais músicas! 🎶`, {});
            console.log(`[MUSIC] Música ${musicId} entregue para ${phone}`);
        }
        else {
            throw new Error('Geração falhou ou não retornou músicas');
        }
    }
    catch (error) {
        console.error(`[MUSIC] Erro ao gerar música para ${phone}:`, error);
        // Atualizar status como falha
        await (0, database_1.updateMusicStatus)(phone, musicId, {
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date()
        });
        // Notificar usuário
        await provider.sendMessage(phone, `❌ *Ops! Erro ao gerar sua música.*\n\n${error.message}\n\nSeu crédito será reembolsado. Entre em contato se o problema persistir.`, {});
        // TODO: Reembolsar crédito
    }
}
//# sourceMappingURL=criarMusicaFlow.js.map