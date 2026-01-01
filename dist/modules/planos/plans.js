"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plans = void 0;
exports.getPlan = getPlan;
exports.getPlanDay = getPlanDay;
exports.plans = [
    {
        id: 'sprint-7d-acelera',
        name: 'Sprint 7 dias Acelera>AI',
        description: 'Implementação express para validar a Copy Matricial',
        duration: 7,
        days: [
            { day: 1, reading: 'Mapeie ICP + dor + promessa', title: 'Diagnóstico rápido' },
            { day: 2, reading: 'Monte 3 ganchos (tensão, prova, desejo)', title: 'Copy Matricial v1' },
            { day: 3, reading: 'Esboce oferta e CTA único', title: 'Oferta enxuta' },
            { day: 4, reading: 'Configurar playbook WhatsApp + follow-up', title: 'Fluxo de abordagem' },
            { day: 5, reading: 'Rodar 10 abordagens e coletar respostas', title: 'Teste de campo' },
            { day: 6, reading: 'Ajustar com base em respostas', title: 'Loop de melhoria' },
            { day: 7, reading: 'Fechar 3 agendas ou pagamentos', title: 'Close e próximos passos' }
        ]
    },
    {
        id: 'rampup-14d-pipeline',
        name: 'Ramp-up 14 dias de pipeline',
        description: 'Para quem quer volume e previsibilidade de follow-up',
        duration: 14,
        days: [
            { day: 1, reading: 'ICP, persona e canais', title: 'Base de dados limpa' },
            { day: 2, reading: 'Matriz de dores e objeções', title: 'Mapa de objeções' },
            { day: 3, reading: 'Roteiro de qualificação (5 perguntas)', title: 'Filtro forte' },
            { day: 4, reading: 'Sequência de 3 toques (WPP/Email)', title: 'Onboarding de contatos' },
            { day: 5, reading: 'Scripts de prova e prova social', title: 'Confiança' },
            { day: 6, reading: 'Oferta escalonada (agenda/proposta/pagamento)', title: 'Escadas de oferta' },
            { day: 7, reading: 'Follow-up com prazos e consequências', title: 'Urgência' },
            { day: 8, reading: 'Segmentar respostas e tags no CRM', title: 'Organização' },
            { day: 9, reading: 'Revisar métricas: resposta, agenda, fechamento', title: 'Medição' },
            { day: 10, reading: 'Ajustar copys com melhores ganchos', title: 'Otimização' },
            { day: 11, reading: 'Playbook de reativação', title: 'Leads frios' },
            { day: 12, reading: 'Objeções críticas: preço, tempo, confiança', title: 'Rebater com clareza' },
            { day: 13, reading: 'Checklist de entrega/implantação', title: 'Segurança na compra' },
            { day: 14, reading: 'Retrospectiva e plano de 30 dias', title: 'Próximo ciclo' }
        ]
    }
];
function getPlan(id) {
    return exports.plans.find(p => p.id === id);
}
function getPlanDay(planId, day) {
    const plan = getPlan(planId);
    return plan?.days.find(d => d.day === day);
}
//# sourceMappingURL=plans.js.map