"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questions = void 0;
exports.getRandomQuestion = getRandomQuestion;
exports.questions = [
    {
        id: 'q1',
        question: 'Para que serve a Copy Matricial no Acelera>AI?',
        options: ['Escrever textos longos', 'Organizar gancho, tensão, prova, oferta e CTA', 'Automatizar CRM', 'Criar landing pages'],
        correctIndex: 1,
        explanation: 'Copy Matricial é a espinha de mensagens em 5 blocos: gancho, tensão, prova, oferta e CTA.',
        difficulty: 'facil',
        points: 10
    },
    {
        id: 'q2',
        question: 'Qual é o microcompromisso ideal após a primeira abordagem?',
        options: ['Enviar proposta completa', 'Pedir todos os documentos', 'Convidar para agenda ou áudio curto', 'Aguardar o lead retornar'],
        correctIndex: 2,
        explanation: 'Depois do primeiro gancho, busque um avanço simples: agenda ou áudio curto para qualificar.',
        difficulty: 'facil',
        points: 10
    },
    {
        id: 'q3',
        question: 'O que medir primeiro em um teste de copy no WhatsApp?',
        options: ['Tempo médio de leitura', 'Taxa de resposta e de agenda', 'Curtidas na mensagem', 'Número de caracteres'],
        correctIndex: 1,
        explanation: 'Taxa de resposta e de agenda mostram se o gancho e a oferta moveram o lead.',
        difficulty: 'facil',
        points: 10
    },
    {
        id: 'q4',
        question: 'Qual o melhor jeito de tratar objeção de preço no Acelera>AI?',
        options: ['Dar desconto imediato', 'Ignorar e seguir', 'Reancorar valor com ROI e propor degrau menor', 'Discutir com o lead'],
        correctIndex: 2,
        explanation: 'Reancore valor com ROI/prova e ofereça um degrau menor (agenda, piloto ou garantia).',
        difficulty: 'medio',
        points: 20
    },
    {
        id: 'q5',
        question: 'Quando usar prova social na sequência?',
        options: ['Antes do gancho', 'Depois de qualificar e antes da oferta', 'Somente no pós-venda', 'Nunca use'],
        correctIndex: 1,
        explanation: 'Prova social funciona melhor após qualificar e antes da oferta para reduzir fricção.',
        difficulty: 'medio',
        points: 20
    },
    {
        id: 'q6',
        question: 'Qual frequência mínima de follow-up recomendada em outbound?',
        options: ['1 toque e parar', '2 toques em 30 dias', '3 a 5 toques em 7-10 dias', '10 toques por dia'],
        correctIndex: 2,
        explanation: 'Sequências enxutas de 3 a 5 toques em até 10 dias mantém ritmo sem saturar.',
        difficulty: 'dificil',
        points: 30
    },
    {
        id: 'q7',
        question: 'Por que testar 3 variações de gancho na mesma semana?',
        options: ['Para gastar mais budget', 'Para confundir o lead', 'Para achar rápido o ângulo que gera resposta', 'Para evitar follow-up'],
        correctIndex: 2,
        explanation: 'Três ângulos em curto prazo aceleram a descoberta do que gera resposta e agenda.',
        difficulty: 'dificil',
        points: 30
    },
    {
        id: 'q8',
        question: 'Qual é o CTA preferencial em outbound consultivo?',
        options: ['“Compre agora”', '“Veja nosso site”', '“Qual é o melhor horário para 1 bate-papo rápido?”', '“Você tem 1 minuto?”'],
        correctIndex: 2,
        explanation: 'CTA de agenda específica (“melhor horário para um bate-papo rápido?”) gera avanço concreto.',
        difficulty: 'facil',
        points: 10
    }
];
function getRandomQuestion(excludeIds = []) {
    const available = exports.questions.filter(q => !excludeIds.includes(q.id));
    if (available.length === 0)
        return null;
    return available[Math.floor(Math.random() * available.length)];
}
//# sourceMappingURL=questions.js.map