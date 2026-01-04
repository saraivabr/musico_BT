"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getRequiredEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
exports.config = {
    port: parseInt(process.env.PORT || '3000', 10),
    mongodb: {
        uri: process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/saraiva-musico'
    },
    openai: {
        apiKey: getRequiredEnv('OPENAI_API_KEY')
    },
    suno: {
        apiKey: getRequiredEnv('SUNO_API_KEY'),
        apiUrl: process.env.SUNO_API_URL || 'https://api.sunoapi.org',
        callbackUrl: process.env.CALLBACK_URL || '',
        costPerSong: parseFloat(process.env.SUNO_COST_PER_SONG || '0.32')
    },
    woovi: {
        apiKey: getRequiredEnv('WOOVI_API_KEY'),
        webhookSecret: process.env.WOOVI_WEBHOOK_SECRET
    },
    r2: {
        accountId: process.env.R2_ACCOUNT_ID || '',
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        bucketName: process.env.R2_BUCKET_NAME || 'escreve-ai-songs',
        publicUrl: process.env.R2_PUBLIC_URL || ''
    },
    bot: {
        name: process.env.BOT_NAME || 'Saraiva',
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        adminPhone: process.env.ADMIN_PHONE || ''
    },
    pricing: {
        pack1: { credits: 1, price: 999 }, // R$9,99
        pack5: { credits: 5, price: 3999 }, // R$39,99
        pack10: { credits: 10, price: 6999 } // R$69,99
    }
};
//# sourceMappingURL=index.js.map