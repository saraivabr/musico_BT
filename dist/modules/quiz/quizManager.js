"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatQuestion = formatQuestion;
exports.startQuiz = startQuiz;
exports.checkAnswer = checkAnswer;
exports.hasActiveQuiz = hasActiveQuiz;
exports.endQuiz = endQuiz;
const database_1 = require("../../services/database");
const questions_1 = require("./questions");
const activeSessions = new Map();
function formatQuestion(question) {
    const options = question.options
        .map((opt, i) => `${['A', 'B', 'C', 'D'][i]}. ${opt}`)
        .join('\n');
    return [
        `*Quiz Bíblico* (${question.points} pts)`,
        '',
        question.question,
        '',
        options,
        '',
        '_Responda com A, B, C ou D_'
    ].join('\n');
}
async function startQuiz(phone) {
    const question = (0, questions_1.getRandomQuestion)();
    if (!question)
        throw new Error('Sem perguntas');
    activeSessions.set(phone, {
        currentQuestion: question,
        answeredIds: [question.id],
        sessionPoints: 0,
        questionsAnswered: 0
    });
    return formatQuestion(question);
}
async function checkAnswer(phone, answer) {
    const session = activeSessions.get(phone);
    if (!session)
        throw new Error('Nenhum quiz ativo');
    const letterIndex = ['a', 'b', 'c', 'd'].indexOf(answer.toLowerCase().trim());
    if (letterIndex === -1)
        throw new Error('Resposta inválida');
    const correct = letterIndex === session.currentQuestion.correctIndex;
    const points = correct ? session.currentQuestion.points : 0;
    session.sessionPoints += points;
    session.questionsAnswered++;
    // Update user stats
    await database_1.User.findOneAndUpdate({ phone }, {
        $inc: {
            'quizStats.totalPoints': points,
            'quizStats.gamesPlayed': 1,
            'quizStats.correctAnswers': correct ? 1 : 0
        }
    });
    // Check if finished (5 questions max)
    if (session.questionsAnswered >= 5) {
        activeSessions.delete(phone);
        return {
            correct,
            explanation: session.currentQuestion.explanation,
            points,
            totalPoints: session.sessionPoints,
            finished: true
        };
    }
    // Next question
    const next = (0, questions_1.getRandomQuestion)(session.answeredIds);
    if (next) {
        session.currentQuestion = next;
        session.answeredIds.push(next.id);
        return {
            correct,
            explanation: session.currentQuestion.explanation,
            points,
            totalPoints: session.sessionPoints,
            nextQuestion: formatQuestion(next),
            finished: false
        };
    }
    activeSessions.delete(phone);
    return {
        correct,
        explanation: session.currentQuestion.explanation,
        points,
        totalPoints: session.sessionPoints,
        finished: true
    };
}
function hasActiveQuiz(phone) {
    return activeSessions.has(phone);
}
function endQuiz(phone) {
    const session = activeSessions.get(phone);
    const points = session?.sessionPoints || 0;
    activeSessions.delete(phone);
    return points;
}
//# sourceMappingURL=quizManager.js.map