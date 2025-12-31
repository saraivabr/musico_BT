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
};
//# sourceMappingURL=index.js.map