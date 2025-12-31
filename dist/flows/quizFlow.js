"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizExitFlow = exports.quizAnswerFlow = exports.quizFlow = void 0;
const bot_1 = require("@builderbot/bot");
const quizManager_1 = require("../modules/quiz/quizManager");
exports.quizFlow = (0, bot_1.addKeyword)(['quiz', 'jogar', 'jogo', '2'])
    .addAction(async (ctx, { flowDynamic }) => {
    if ((0, quizManager_1.hasActiveQuiz)(ctx.from)) {
        await flowDynamic('Voce ja tem um quiz ativo! Responda ou digite "sair".');
        return;
    }
    await flowDynamic('*Quiz Biblico!* Vamos testar seu conhecimento. 5 perguntas!');
    const question = await (0, quizManager_1.startQuiz)(ctx.from);
    await flowDynamic(question);
});
exports.quizAnswerFlow = (0, bot_1.addKeyword)(['a', 'b', 'c', 'd'])
    .addAction(async (ctx, { flowDynamic }) => {
    if (!(0, quizManager_1.hasActiveQuiz)(ctx.from))
        return;
    try {
        const result = await (0, quizManager_1.checkAnswer)(ctx.from, ctx.body);
        if (result.correct) {
            await flowDynamic(`*Correto!* +${result.points} pts\n\n${result.explanation}`);
        }
        else {
            await flowDynamic(`*Errou!*\n\n${result.explanation}`);
        }
        if (result.finished) {
            await flowDynamic(`\n*Quiz Finalizado!* Total: ${result.totalPoints} pontos\n\nDigite "quiz" para jogar de novo!`);
        }
        else if (result.nextQuestion) {
            await flowDynamic(result.nextQuestion);
        }
    }
    catch {
        await flowDynamic('Responda com A, B, C ou D.');
    }
});
exports.quizExitFlow = (0, bot_1.addKeyword)(['sair', 'parar'])
    .addAction(async (ctx, { flowDynamic }) => {
    if ((0, quizManager_1.hasActiveQuiz)(ctx.from)) {
        const points = (0, quizManager_1.endQuiz)(ctx.from);
        await flowDynamic(`Quiz encerrado! Voce fez ${points} pontos.`);
    }
});
//# sourceMappingURL=quizFlow.js.map