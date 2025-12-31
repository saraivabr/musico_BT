"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.questions = void 0;
exports.getRandomQuestion = getRandomQuestion;
exports.questions = [
    {
        id: 'q1',
        question: 'Quantos dias Deus levou para criar o mundo?',
        options: ['5 dias', '6 dias', '7 dias', '10 dias'],
        correctIndex: 1,
        explanation: 'Gênesis 1 nos conta que Deus criou tudo em 6 dias e descansou no sétimo.',
        difficulty: 'facil',
        points: 10
    },
    {
        id: 'q2',
        question: 'Quem construiu a arca?',
        options: ['Abraão', 'Moisés', 'Noé', 'Davi'],
        correctIndex: 2,
        explanation: 'Noé construiu a arca para salvar sua família e os animais do dilúvio.',
        difficulty: 'facil',
        points: 10
    },
    {
        id: 'q3',
        question: 'Qual é o versículo mais famoso da Bíblia?',
        options: ['Gênesis 1:1', 'João 3:16', 'Salmos 23:1', 'Romanos 8:28'],
        correctIndex: 1,
        explanation: 'João 3:16 - "Porque Deus amou o mundo de tal maneira..."',
        difficulty: 'facil',
        points: 10
    },
    {
        id: 'q4',
        question: 'Quantos discípulos Jesus tinha?',
        options: ['10', '11', '12', '13'],
        correctIndex: 2,
        explanation: 'Jesus escolheu 12 discípulos para segui-lo.',
        difficulty: 'medio',
        points: 20
    },
    {
        id: 'q5',
        question: 'Qual foi o primeiro milagre de Jesus?',
        options: ['Curar um cego', 'Multiplicar pães', 'Transformar água em vinho', 'Ressuscitar Lázaro'],
        correctIndex: 2,
        explanation: 'Em João 2, Jesus transformou água em vinho nas bodas de Caná.',
        difficulty: 'medio',
        points: 20
    },
    {
        id: 'q6',
        question: 'Quantos livros tem o Antigo Testamento?',
        options: ['36', '39', '42', '45'],
        correctIndex: 1,
        explanation: 'O Antigo Testamento contém 39 livros.',
        difficulty: 'dificil',
        points: 30
    },
    {
        id: 'q7',
        question: 'Quem foi o homem mais velho da Bíblia?',
        options: ['Noé (950)', 'Adão (930)', 'Matusalém (969)', 'Enoque (365)'],
        correctIndex: 2,
        explanation: 'Matusalém viveu 969 anos (Gênesis 5:27).',
        difficulty: 'dificil',
        points: 30
    },
    {
        id: 'q8',
        question: 'Qual profeta foi engolido por um grande peixe?',
        options: ['Elias', 'Eliseu', 'Jonas', 'Daniel'],
        correctIndex: 2,
        explanation: 'Jonas foi engolido por um peixe e ficou 3 dias em seu ventre.',
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