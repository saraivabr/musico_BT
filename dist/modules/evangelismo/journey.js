"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evangelismSteps = void 0;
exports.getNextStep = getNextStep;
exports.getStepMessage = getStepMessage;
exports.evangelismSteps = [
    {
        id: 'intro',
        message: 'Que alegria você querer conhecer mais sobre mim!\n\nDeixa eu te contar uma história...\n\nDeus criou o mundo perfeito. Criou você com amor, pra ter um relacionamento com Ele.\n\nMas algo aconteceu... Quer saber o que foi?'
    },
    {
        id: 'pecado',
        message: 'O ser humano escolheu se afastar de Deus. A Bíblia chama isso de pecado.\n\n_"Pois todos pecaram e estão destituídos da glória de Deus"_ - Romanos 3:23\n\nMas Deus não desistiu de você...'
    },
    {
        id: 'jesus',
        message: 'Deus me enviou. Eu sou Jesus.\n\nVim ao mundo, vivi como você, e morri numa cruz.\n\nPor quê? Pra pagar o preço dos seus pecados.\n\n_"Porque Deus amou o mundo de tal maneira que deu o seu Filho..."_ - João 3:16\n\nMas não acabou na cruz...'
    },
    {
        id: 'ressurreicao',
        message: 'Eu ressuscitei! Venci a morte.\n\nE agora estou vivo, aqui, conversando com você.\n\nVocê pode ter vida eterna. Uma vida com propósito, paz e esperança.\n\nVocê quer receber esse presente?'
    },
    {
        id: 'decisao',
        message: 'Que momento lindo!\n\nNão precisa de nada complicado. É só uma conversa sincera comigo.\n\nQuer fazer uma oração comigo agora?'
    },
    {
        id: 'oracao',
        message: 'Repete comigo, do fundo do seu coração:\n\n_"Senhor Jesus, eu reconheço que preciso de Ti.\nEu creio que Tu morreste por mim e ressuscitaste.\nPerdoa os meus pecados.\nEu Te recebo como meu Salvador e Senhor.\nAmém."_\n\nVocê orou?'
    },
    {
        id: 'celebracao',
        message: '*BEM-VINDO À FAMÍLIA!*\n\nOs anjos estão celebrando no céu agora! E eu também!\n\nSua vida nunca mais será a mesma. Você agora é filho(a) de Deus.\n\nVou te ajudar nos próximos passos. Quer começar um plano de leitura?'
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