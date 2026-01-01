"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reenviarMusicaFlow = exports.minhasMusicasFlow = void 0;
const bot_1 = require("@builderbot/bot");
const database_1 = require("../services/database");
const user_1 = require("../types/user");
function getStyleEmoji(styleId) {
    const style = user_1.MUSIC_STYLES.find(s => s.id === styleId);
    return style?.emoji || '🎵';
}
function formatStatus(status) {
    switch (status) {
        case 'generating': return '⏳ Gerando...';
        case 'ready': return '✅ Pronta';
        case 'failed': return '❌ Falhou';
        default: return status;
    }
}
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
exports.minhasMusicasFlow = (0, bot_1.addKeyword)(['minhas', 'historico', 'histórico', 'musicas', 'músicas', '2'])
    .addAction(async (ctx, { flowDynamic, provider }) => {
    const phone = ctx.from;
    const user = await (0, database_1.getOrCreateUser)(phone);
    const musics = await (0, database_1.getUserMusics)(phone, 10);
    if (musics.length === 0) {
        await flowDynamic([
            `🎵 *Minhas Músicas*\n\nVocê ainda não criou nenhuma música.\n\n💡 Digite *criar* para fazer sua primeira música!`
        ]);
        return;
    }
    // Header
    await flowDynamic([
        `🎵 *Minhas Músicas* (${musics.length})\n\nSeus créditos: *${user.credits}*`
    ]);
    // Listar músicas
    for (const music of musics) {
        const emoji = getStyleEmoji(music.style);
        const status = formatStatus(music.status);
        const date = formatDate(music.createdAt);
        const title = music.title || 'Sem título';
        let message = `${emoji} *${title}*\n📅 ${date}\n${status}`;
        if (music.status === 'ready' && music.audioUrl) {
            message += `\n\n🔗 ${music.audioUrl}`;
        }
        if (music.status === 'failed' && music.errorMessage) {
            message += `\n⚠️ ${music.errorMessage}`;
        }
        await flowDynamic(message);
        // Se a música está pronta, enviar o áudio
        if (music.status === 'ready' && music.audioUrl) {
            try {
                await provider.sendMessage(phone, '🎵', { media: music.audioUrl });
            }
            catch (e) {
                // Ignora erro se não conseguir enviar áudio
            }
        }
    }
    await flowDynamic([
        `\n💡 Digite *criar* para fazer mais músicas!`
    ]);
});
// Flow para reenviar uma música específica
exports.reenviarMusicaFlow = (0, bot_1.addKeyword)(['reenviar', 'baixar'])
    .addAction(async (ctx, { flowDynamic, provider }) => {
    const phone = ctx.from;
    const musics = await (0, database_1.getUserMusics)(phone, 1);
    if (musics.length === 0 || musics[0].status !== 'ready') {
        await flowDynamic('❌ Nenhuma música disponível para reenviar.');
        return;
    }
    const music = musics[0];
    await flowDynamic(`📤 Reenviando *${music.title || 'sua música'}*...`);
    if (music.audioUrl) {
        await provider.sendMessage(phone, '🎵 Sua música:', { media: music.audioUrl });
        await flowDynamic(`🔗 Link: ${music.audioUrl}`);
    }
    if (music.videoUrl) {
        await flowDynamic(`🎬 Vídeo: ${music.videoUrl}`);
    }
});
//# sourceMappingURL=minhasMusicasFlow.js.map