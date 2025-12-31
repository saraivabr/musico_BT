export type Intent =
  | 'devocional'
  | 'quiz'
  | 'oracao'
  | 'aconselhamento'
  | 'evangelismo'
  | 'busca_biblica'
  | 'midia'
  | 'comunidade'
  | 'indicacao'
  | 'plano_leitura'
  | 'conversa_livre'
  | 'saudacao'
  | 'menu'

interface IntentPattern {
  intent: Intent
  patterns: RegExp[]
  keywords: string[]
}

const intentPatterns: IntentPattern[] = [
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
    patterns: [/devocional|versículo do dia|versiculo|palavra do dia/i],
    keywords: ['devocional', 'versículo', 'versiculo', 'palavra do dia']
  },
  {
    intent: 'quiz',
    patterns: [/quiz|jogar|jogo|pergunta|desafio bíblico/i],
    keywords: ['quiz', 'jogar', 'jogo', 'pergunta', 'desafio']
  },
  {
    intent: 'oracao',
    patterns: [/ora comigo|oração|oracao|pedido de oração|ore por/i],
    keywords: ['oração', 'oracao', 'orar', 'ore', 'pedido']
  },
  {
    intent: 'plano_leitura',
    patterns: [/plano de leitura|plano bíblico|ler a bíblia|21 dias/i],
    keywords: ['plano', 'leitura', '21 dias']
  },
  {
    intent: 'busca_biblica',
    patterns: [/o que a bíblia fala|bíblia diz|versículo sobre/i],
    keywords: ['bíblia fala', 'bíblia diz', 'versículo sobre']
  },
  {
    intent: 'evangelismo',
    patterns: [/quero conhecer jesus|aceitar jesus|quem é jesus|como ser salvo/i],
    keywords: ['conhecer jesus', 'aceitar', 'salvo', 'vida eterna']
  },
  {
    intent: 'indicacao',
    patterns: [/meu amigo|minha amiga|precisa de ajuda/i],
    keywords: ['amigo precisa', 'indicar']
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
]

export function detectIntent(message: string): Intent {
  const lower = message.toLowerCase().trim()

  for (const { intent, patterns, keywords } of intentPatterns) {
    for (const pattern of patterns) {
      if (pattern.test(lower)) return intent
    }
    for (const keyword of keywords) {
      if (lower.includes(keyword)) return intent
    }
  }

  return 'conversa_livre'
}

export function isCrisis(message: string): boolean {
  const crisisPatterns = [
    /suicid/i,
    /me matar/i,
    /quero morrer/i,
    /não aguento mais/i,
    /acabar com tudo/i,
    /sem razão para viver/i
  ]
  return crisisPatterns.some(p => p.test(message))
}
