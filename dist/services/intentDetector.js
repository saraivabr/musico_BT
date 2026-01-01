"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectIntent = detectIntent;
exports.isCrisis = isCrisis;
const intentPatterns = [
    {
        intent: 'saudacao',
        patterns: [/^(oi|olá|ola|hey|eai|e ai|bom dia|boa tarde|boa noite|opa)[\s!?.]*$/i],
        keywords: ['oi', 'olá', 'ola', 'hey', 'eai']
    },
    {
        intent: 'menu',
        patterns: [/^(menu|ajuda|help|comandos|o que você faz|opções)[\s?]*$/i],
        keywords: ['menu', 'ajuda', 'comandos', 'opções']
    },
    {
        intent: 'devocional',
        patterns: [/p[ií]lula|dica do dia|acelera/i],
        keywords: ['pilula', 'dica', 'acelera']
    },
    {
        intent: 'quiz',
        patterns: [/quiz|diagn[oó]stico|perguntas rápidas/i],
        keywords: ['quiz', 'diagnostico', 'diagnóstico', 'pergunta']
    },
    {
        intent: 'oracao',
        patterns: [/estrat[eé]gia|plano|proposta|brief/i],
        keywords: ['estrategia', 'estratégia', 'plano', 'proposta', 'briefing']
    },
    {
        intent: 'plano_leitura',
        patterns: [/plano de implementação|sprint|rampa|pipeline/i],
        keywords: ['plano', 'implementacao', 'implementação', 'sprint', 'pipeline']
    },
    {
        intent: 'busca_biblica',
        patterns: [/playbook|copy|roteiro|modelo de mensagem/i],
        keywords: ['playbook', 'copy', 'modelo', 'roteiro']
    },
    {
        intent: 'evangelismo',
        patterns: [/acelera|m[eé]todo|acelera>ai|como funciona/i],
        keywords: ['acelera', 'metodo', 'método', 'acelera ai']
    },
    {
        intent: 'indicacao',
        patterns: [/lead|parceiro|indicar/i],
        keywords: ['lead', 'indicar', 'parceiro']
    },
    {
        intent: 'midia',
        patterns: [/louvor|pregação|música|vídeo|testemunho/i],
        keywords: ['louvor', 'pregação', 'música', 'vídeo']
    },
    {
        intent: 'comunidade',
        patterns: [/grupo|comunidade|outras pessoas|células/i],
        keywords: ['grupo', 'comunidade', 'células']
    },
    {
        intent: 'aconselhamento',
        patterns: [/preciso conversar|estou mal|me ajuda|não sei o que fazer/i],
        keywords: ['conversar', 'ajuda', 'conselho', 'problema']
    }
];
function detectIntent(message) {
    if (!message || typeof message !== 'string') {
        return 'conversa_livre';
    }
    const lower = message.toLowerCase().trim();
    for (const { intent, patterns, keywords } of intentPatterns) {
        for (const pattern of patterns) {
            if (pattern.test(lower))
                return intent;
        }
        for (const keyword of keywords) {
            if (lower.includes(keyword))
                return intent;
        }
    }
    return 'conversa_livre';
}
function isCrisis(message) {
    if (!message || typeof message !== 'string') {
        return false;
    }
    const crisisPatterns = [
        /suicid/i,
        /me matar/i,
        /quero morrer/i,
        /não aguento mais/i,
        /acabar com tudo/i,
        /sem razão para viver/i
    ];
    return crisisPatterns.some(p => p.test(message));
}
//# sourceMappingURL=intentDetector.js.map