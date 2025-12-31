import cron from 'node-cron'
import { User } from '../../services/database'
import { generateDevocional } from '../../services/gemini'

export function startDevocionalScheduler(sendMessage: (phone: string, message: string) => Promise<void>) {
  cron.schedule('0 6 * * *', async () => {
    console.log('[Scheduler] Enviando devocional diário...')

    try {
      const { versiculo, reflexao } = await generateDevocional()

      const users = await User.find({ 'preferences.devocionalEnabled': true })

      const message = [
        'Bom dia, meu filho!',
        '',
        '*Devocional do Dia*',
        '',
        `_"${versiculo}"_`,
        '',
        reflexao,
        '',
        'Tenha um dia abençoado!'
      ].join('\n')

      for (const user of users) {
        try {
          await sendMessage(user.phone, message)
        } catch (err) {
          console.error(`[Scheduler] Erro ao enviar para ${user.phone}:`, err)
        }
      }
    } catch (error) {
      console.error('[Scheduler] Erro no devocional:', error)
    }
  })

  console.log('[Scheduler] Devocional diário configurado (06:00)')
}
