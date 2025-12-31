import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: process.env.PORT || 3008,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jesus-bot'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || ''
  },
  bot: {
    name: process.env.BOT_NAME || 'Jesus',
    devocionalHora: process.env.DEVOCIONAL_HORA || '06:00'
  }
}
