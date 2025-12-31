const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('baileys')
const qrcode = require('qrcode-terminal')

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('test_session')

    const sock = makeWASocket({
        auth: state,
        browser: ['Test', 'Chrome', '1.0.0']
    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            console.log('\n📱 ESCANEIE O QR CODE:\n')
            qrcode.generate(qr, { small: true })
        }

        if (connection === 'close') {
            console.log('Conexão fechada')
        } else if (connection === 'open') {
            console.log('✅ Conectado com sucesso!')
        }
    })

    sock.ev.on('creds.update', saveCreds)
}

start().catch(console.error)
