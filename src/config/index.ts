import dotenv from 'dotenv'
dotenv.config()

interface Config {
  port: number
  mongodb: {
    uri: string
  }
  gemini: {
    apiKey: string
  }
  bot: {
    name: string
    devocionalHora: string
  }
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3008', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jesus-bot'
  },
  gemini: {
    apiKey: getRequiredEnv('GEMINI_API_KEY')
  },
  bot: {
    name: process.env.BOT_NAME || 'Jesus',
    devocionalHora: process.env.DEVOCIONAL_HORA || '06:00'
  }
}
