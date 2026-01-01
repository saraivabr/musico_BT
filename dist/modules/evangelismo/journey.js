"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evangelismSteps = void 0;
exports.getNextStep = getNextStep;
exports.getStepMessage = getStepMessage;
exports.evangelismSteps = [
    {
        id: 'intro',
        message: 'Que bom que você quer conhecer o método Acelera>AI da Saraiva.AI.\n\nEle decodifica a psique do lead pelas mensagens e monta copys que fazem o lead avançar.\n\nPosso te contar como funciona na prática?'
    },
    {
        id: 'dor',
        message: 'Primeiro, mapeamos dor, urgência e maturidade em 3 perguntas. Assim priorizamos quem quer comprar agora.\n\nQuer ver o próximo passo?'
    },
    {
        id: 'copy',
        message: 'Depois aplicamos a Copy Matricial: Gancho, Tensão, Prova, Oferta e CTA único.\n\nMensagens curtas no WhatsApp, direto ao avanço.\n\nQuer saber como testamos rápido?'
    },
    {
        id: 'teste',
        message: 'Rodamos 3 variações em 48h, medindo resposta e agendas. Ajustamos no loop até travar um padrão que converte.\n\nAssim quem quer comprar compra mais rápido.\n\nPosso te mostrar um plano de 7 dias pra começar?'
    },
    {
        id: 'decisao',
        message: 'Fechamos com um plano simples: diagnóstico + 3 copys + sequência de follow-up.\n\nTopo te entregar esse plano agora mesmo, adaptado ao seu nicho. Quer receber?'
    },
    {
        id: 'plano',
        message: '*Pronto!* Vou te mandar o esqueleto:\n\n1) 3 perguntas de fit\n2) 3 ganchos + CTA\n3) Sequência de follow-up\n\nMe fala seu nicho e tipo de oferta para eu personalizar e já agendamos 15min (me diga dois horários).'
    }
];
function getNextStep(currentId) {
    const idx = exports.evangelismSteps.findIndex(s => s.id === currentId);
    if (idx === -1 || idx >= exports.evangelismSteps.length - 1)
        return null;
    return exports.evangelismSteps[idx + 1].id;
}
function getStepMessage(stepId) {
    const step = exports.evangelismSteps.find(s => s.id === stepId);
    return step?.message || null;
}
//# sourceMappingURL=journey.js.map