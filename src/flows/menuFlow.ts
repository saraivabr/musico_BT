import { addKeyword } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { getOrCreateUser } from '../services/database'

export const menuFlow = addKeyword<BaileysProvider>(['menu', 'ajuda', 'help', 'opcoes', 'opções'])
    .addAction(async (ctx, { flowDynamic }) => {
        const phone = ctx.from
        const user = await getOrCreateUser(phone)
        const credits = user.credits || 0

        await flowDynamic([
            `🎵 *Saraiva* - Menu Principal 🎤\n\n💰 *Seus créditos:* ${credits}\n\n📋 *O que você deseja fazer?*\n\n1️⃣ *Criar música* - Componha sua próxima hit\n2️⃣ *Minhas músicas* - Veja suas criações\n3️⃣ *Comprar créditos* - Adquira mais créditos\n\nDigite o número da opção desejada! 🎶`
        ])
    })
