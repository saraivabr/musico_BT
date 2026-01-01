"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inicializarMonitoramento = inicializarMonitoramento;
exports.enviarAlerta = enviarAlerta;
exports.alertarDuvidaNaoRespondida = alertarDuvidaNaoRespondida;
exports.alertarObjecaoNova = alertarObjecaoNova;
exports.alertarLeadQuente = alertarLeadQuente;
exports.alertarErro = alertarErro;
exports.alertarBloqueio = alertarBloqueio;
exports.alertarPassagemCloser = alertarPassagemCloser;
exports.alertarFeedback = alertarFeedback;
exports.enviarRelatorioDiario = enviarRelatorioDiario;
exports.setGrupoId = setGrupoId;
exports.getGrupoId = getGrupoId;
// Configuração do grupo de monitoramento
let config = {
    grupoNome: '🤖 VDI - Monitoramento',
    participantes: []
};
let provider = null;
let grupoId = null;
// ============================================================
// INICIALIZAÇÃO
// ============================================================
async function inicializarMonitoramento(baileysProvider, numerosDono) {
    provider = baileysProvider;
    config.participantes = numerosDono.map(formatarNumero);
    // Tenta encontrar grupo existente ou cria novo
    grupoId = await encontrarOuCriarGrupo();
    if (grupoId) {
        await enviarAlerta({
            tipo: 'feedback',
            contexto: '✅ Monitoramento iniciado! Vou reportar aqui tudo que precisar de atenção.',
            urgencia: 'baixa',
            timestamp: new Date()
        });
    }
    return grupoId || '';
}
async function encontrarOuCriarGrupo() {
    if (!provider)
        return null;
    try {
        // @ts-ignore - Acesso ao socket do Baileys
        const sock = provider.vendor;
        // Tenta criar grupo
        const grupo = await sock.groupCreate(config.grupoNome, config.participantes);
        console.log(`[Monitoramento] Grupo criado: ${grupo.id}`);
        // Atualiza descrição do grupo
        await sock.groupUpdateDescription(grupo.id, `
🤖 *Grupo de Monitoramento VDI*

Aqui o bot reporta:
• Dúvidas que não soube responder
• Objeções novas encontradas
• Leads quentes que precisam de atenção
• Erros e situações estranhas
• Passagens pro closer

Use as informações pra ir melhorando o bot!
    `.trim());
        return grupo.id;
    }
    catch (error) {
        console.error('[Monitoramento] Erro ao criar grupo:', error);
        return null;
    }
}
// ============================================================
// ENVIO DE ALERTAS
// ============================================================
async function enviarAlerta(alerta) {
    if (!provider || !grupoId) {
        console.log('[Monitoramento] Grupo não configurado, alerta ignorado');
        return false;
    }
    const mensagem = formatarAlerta(alerta);
    try {
        // @ts-ignore
        await provider.vendor.sendMessage(grupoId, { text: mensagem });
        console.log(`[Monitoramento] Alerta enviado: ${alerta.tipo}`);
        return true;
    }
    catch (error) {
        console.error('[Monitoramento] Erro ao enviar alerta:', error);
        return false;
    }
}
function formatarAlerta(alerta) {
    const emojis = {
        duvida: '❓',
        objecao_nova: '🆕',
        lead_quente: '🔥',
        erro: '❌',
        bloqueio: '🚫',
        feedback: '💬',
        passagem_closer: '🎯'
    };
    const urgencias = {
        baixa: '',
        media: '⚠️ ',
        alta: '🚨 '
    };
    const emoji = emojis[alerta.tipo] || '📢';
    const urgencia = urgencias[alerta.urgencia] || '';
    let msg = `${urgencia}${emoji} *${alerta.tipo.toUpperCase().replace('_', ' ')}*\n\n`;
    if (alerta.leadName || alerta.leadPhone) {
        msg += `👤 *Lead:* ${alerta.leadName || 'Sem nome'}\n`;
        msg += `📱 ${alerta.leadPhone || 'Sem telefone'}\n\n`;
    }
    if (alerta.mensagemLead) {
        msg += `💬 *O que o lead disse:*\n"${alerta.mensagemLead}"\n\n`;
    }
    msg += `📋 *Contexto:*\n${alerta.contexto}\n`;
    if (alerta.sugestao) {
        msg += `\n💡 *Sugestão:*\n${alerta.sugestao}\n`;
    }
    msg += `\n🕐 ${alerta.timestamp.toLocaleString('pt-BR')}`;
    return msg;
}
// ============================================================
// ALERTAS ESPECÍFICOS
// ============================================================
async function alertarDuvidaNaoRespondida(leadPhone, leadName, mensagemLead, tentativaResposta) {
    await enviarAlerta({
        tipo: 'duvida',
        leadPhone,
        leadName,
        mensagemLead,
        contexto: `Bot não teve certeza de como responder.\n\nTentou responder com:\n"${tentativaResposta}"`,
        sugestao: 'Avaliar se a resposta foi boa. Se não, adicionar esse caso ao playbook.',
        urgencia: 'media',
        timestamp: new Date()
    });
}
async function alertarObjecaoNova(leadPhone, leadName, objecao, respostaUsada) {
    await enviarAlerta({
        tipo: 'objecao_nova',
        leadPhone,
        leadName,
        mensagemLead: objecao,
        contexto: `Objeção não mapeada no playbook.\n\nBot respondeu com:\n"${respostaUsada}"`,
        sugestao: 'Se essa objeção aparecer de novo, vale adicionar ao playbook.',
        urgencia: 'baixa',
        timestamp: new Date()
    });
}
async function alertarLeadQuente(leadPhone, leadName, motivo, ultimaMensagem) {
    await enviarAlerta({
        tipo: 'lead_quente',
        leadPhone,
        leadName,
        mensagemLead: ultimaMensagem,
        contexto: `Lead demonstrou alto interesse!\n\nMotivo: ${motivo}`,
        sugestao: 'Considerar entrar manualmente pra fechar.',
        urgencia: 'alta',
        timestamp: new Date()
    });
}
async function alertarErro(erro, contexto, leadPhone) {
    await enviarAlerta({
        tipo: 'erro',
        leadPhone,
        contexto: `Erro no sistema:\n${erro}\n\nContexto: ${contexto}`,
        sugestao: 'Verificar logs e corrigir.',
        urgencia: 'alta',
        timestamp: new Date()
    });
}
async function alertarBloqueio(leadPhone, leadName, historicoResumido) {
    await enviarAlerta({
        tipo: 'bloqueio',
        leadPhone,
        leadName,
        contexto: `Lead pediu pra parar ou bloqueou.\n\nHistórico:\n${historicoResumido}`,
        sugestao: 'Analisar se a abordagem foi muito agressiva.',
        urgencia: 'media',
        timestamp: new Date()
    });
}
async function alertarPassagemCloser(leadPhone, leadName, resumoQualificacao, temperatura) {
    await enviarAlerta({
        tipo: 'passagem_closer',
        leadPhone,
        leadName,
        contexto: `Lead qualificado e pronto pro closer!\n\n${resumoQualificacao}`,
        sugestao: `Temperatura: ${temperatura.toUpperCase()} - Entrar em contato o mais rápido possível!`,
        urgencia: 'alta',
        timestamp: new Date()
    });
}
async function alertarFeedback(mensagem) {
    await enviarAlerta({
        tipo: 'feedback',
        contexto: mensagem,
        urgencia: 'baixa',
        timestamp: new Date()
    });
}
// ============================================================
// RELATÓRIOS
// ============================================================
async function enviarRelatorioDiario(stats) {
    const msg = `📊 *RELATÓRIO DIÁRIO*

📥 Conversas novas: ${stats.conversasNovas}
💬 Conversas respondidas: ${stats.conversasRespondidas}
✅ Leads qualificados: ${stats.leadsQualificados}
❌ Leads desqualificados: ${stats.leadsDesqualificados}
🔄 Follow-ups enviados: ${stats.followupsEnviados}
🚫 Bloqueios: ${stats.bloqueios}

📈 Taxa de qualificação: ${stats.conversasNovas ? ((stats.leadsQualificados / stats.conversasNovas) * 100).toFixed(1) : 0}%

🕐 ${new Date().toLocaleString('pt-BR')}`;
    if (provider && grupoId) {
        try {
            // @ts-ignore
            await provider.vendor.sendMessage(grupoId, { text: msg });
        }
        catch (error) {
            console.error('[Monitoramento] Erro ao enviar relatório:', error);
        }
    }
}
// ============================================================
// UTILS
// ============================================================
function formatarNumero(numero) {
    // Remove tudo que não é número
    const limpo = numero.replace(/\D/g, '');
    // Adiciona código do país se não tiver
    if (limpo.length === 11) {
        return `55${limpo}@s.whatsapp.net`;
    }
    else if (limpo.length === 13 && limpo.startsWith('55')) {
        return `${limpo}@s.whatsapp.net`;
    }
    return `${limpo}@s.whatsapp.net`;
}
function setGrupoId(id) {
    grupoId = id;
}
function getGrupoId() {
    return grupoId;
}
//# sourceMappingURL=monitoramento.js.map