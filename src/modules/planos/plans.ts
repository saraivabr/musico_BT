export interface ReadingPlan {
  id: string
  name: string
  description: string
  duration: number
  days: Array<{ day: number; reading: string; title: string }>
}

export const plans: ReadingPlan[] = [
  {
    id: '21-dias-jesus',
    name: '21 Dias com Jesus',
    description: 'Uma jornada pelos ensinamentos de Jesus',
    duration: 21,
    days: [
      { day: 1, reading: 'João 1:1-18', title: 'O Verbo se fez carne' },
      { day: 2, reading: 'Mateus 5:1-16', title: 'Bem-aventuranças' },
      { day: 3, reading: 'Mateus 5:17-48', title: 'A lei do amor' },
      { day: 4, reading: 'Mateus 6:1-18', title: 'Como orar' },
      { day: 5, reading: 'Mateus 6:19-34', title: 'Não se preocupe' },
      { day: 6, reading: 'Lucas 15:1-32', title: 'Parábolas da graça' },
      { day: 7, reading: 'João 3:1-21', title: 'Nascer de novo' },
      { day: 8, reading: 'João 4:1-42', title: 'Água viva' },
      { day: 9, reading: 'João 6:22-59', title: 'Pão da vida' },
      { day: 10, reading: 'João 10:1-21', title: 'O bom pastor' },
      { day: 11, reading: 'João 11:1-44', title: 'Ressurreição de Lázaro' },
      { day: 12, reading: 'João 13:1-17', title: 'Lavando os pés' },
      { day: 13, reading: 'João 14:1-14', title: 'Eu sou o caminho' },
      { day: 14, reading: 'João 15:1-17', title: 'A videira verdadeira' },
      { day: 15, reading: 'Mateus 26:36-56', title: 'Getsêmani' },
      { day: 16, reading: 'Mateus 27:27-56', title: 'A crucificação' },
      { day: 17, reading: 'Mateus 28:1-20', title: 'A ressurreição' },
      { day: 18, reading: 'Lucas 24:13-35', title: 'Emaús' },
      { day: 19, reading: 'João 20:19-31', title: 'Tomé e a fé' },
      { day: 20, reading: 'João 21:1-19', title: 'Restauração de Pedro' },
      { day: 21, reading: 'Atos 1:1-11', title: 'A ascensão' }
    ]
  },
  {
    id: 'novo-crente',
    name: 'Primeiros Passos',
    description: 'Para quem acabou de aceitar Jesus',
    duration: 7,
    days: [
      { day: 1, reading: 'João 3:16-21', title: 'O amor de Deus' },
      { day: 2, reading: 'Romanos 8:1-17', title: 'Sem condenação' },
      { day: 3, reading: 'Efésios 2:1-10', title: 'Salvos pela graça' },
      { day: 4, reading: '1 João 1:5-10', title: 'Andando na luz' },
      { day: 5, reading: 'Filipenses 4:4-13', title: 'Alegria e paz' },
      { day: 6, reading: 'Mateus 28:16-20', title: 'A grande comissão' },
      { day: 7, reading: 'Salmo 23', title: 'O Senhor é meu pastor' }
    ]
  }
]

export function getPlan(id: string) {
  return plans.find(p => p.id === id)
}

export function getPlanDay(planId: string, day: number) {
  const plan = getPlan(planId)
  return plan?.days.find(d => d.day === day)
}
