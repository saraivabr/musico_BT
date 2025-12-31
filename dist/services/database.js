"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationSummary = exports.Conversation = exports.User = void 0;
exports.connectDB = connectDB;
exports.getOrCreateUser = getOrCreateUser;
exports.updateUser = updateUser;
exports.saveConversation = saveConversation;
exports.getRecentConversations = getRecentConversations;
const mongoose_1 = __importStar(require("mongoose"));
const config_1 = require("../config");
// User Schema
const userSchema = new mongoose_1.Schema({
    phone: { type: String, required: true, unique: true, index: true },
    name: String,
    createdAt: { type: Date, default: Date.now },
    lastInteraction: { type: Date, default: Date.now },
    spiritualLevel: { type: String, enum: ['iniciante', 'crescendo', 'maduro'], default: 'iniciante' },
    currentPlan: {
        planId: String,
        day: Number,
        startedAt: Date
    },
    quizStats: {
        totalPoints: { type: Number, default: 0 },
        gamesPlayed: { type: Number, default: 0 },
        correctAnswers: { type: Number, default: 0 }
    },
    prayerRequests: [{
            id: String,
            request: String,
            createdAt: Date,
            status: { type: String, enum: ['active', 'answered'], default: 'active' },
            followUpSent: { type: Boolean, default: false }
        }],
    referredBy: String,
    referrals: [String],
    preferences: {
        devocionalEnabled: { type: Boolean, default: true },
        devocionalTime: { type: String, default: '06:00' }
    }
});
// Conversation Schema with compound index
const conversationSchema = new mongoose_1.Schema({
    phone: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, maxlength: 10000 },
    intent: String,
    emotion: String
});
// Compound index for efficient queries
conversationSchema.index({ phone: 1, timestamp: -1 });
// Summary Schema
const summarySchema = new mongoose_1.Schema({
    phone: { type: String, required: true, unique: true },
    summary: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    keyTopics: [String]
});
exports.User = mongoose_1.default.model('User', userSchema);
exports.Conversation = mongoose_1.default.model('Conversation', conversationSchema);
exports.ConversationSummary = mongoose_1.default.model('ConversationSummary', summarySchema);
// Phone validation helper
function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
        throw new Error('Phone number is required');
    }
    // Remove non-digits and check length (10-15 digits for international)
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
        throw new Error('Invalid phone number format');
    }
}
async function connectDB() {
    try {
        await mongoose_1.default.connect(config_1.config.mongodb.uri);
        console.log('[DB] MongoDB conectado com sucesso');
    }
    catch (error) {
        console.error('[DB] Erro ao conectar MongoDB:', error);
        process.exit(1);
    }
}
async function getOrCreateUser(phone) {
    validatePhone(phone);
    try {
        let user = await exports.User.findOne({ phone });
        if (!user) {
            user = await exports.User.create({ phone });
            console.log(`[DB] Novo usuário criado: ${phone}`);
        }
        return user;
    }
    catch (error) {
        console.error(`[DB] Erro ao buscar/criar usuário ${phone}:`, error);
        throw error;
    }
}
async function updateUser(phone, data) {
    validatePhone(phone);
    // Prevent overwriting system fields
    const { createdAt, phone: _, ...safeData } = data;
    try {
        const user = await exports.User.findOneAndUpdate({ phone }, { ...safeData, lastInteraction: new Date() }, { new: true });
        return user;
    }
    catch (error) {
        console.error(`[DB] Erro ao atualizar usuário ${phone}:`, error);
        throw error;
    }
}
async function saveConversation(phone, role, content, intent, emotion) {
    validatePhone(phone);
    if (!content || content.length === 0) {
        throw new Error('Content is required');
    }
    try {
        await exports.Conversation.create({ phone, role, content, intent, emotion });
    }
    catch (error) {
        console.error(`[DB] Erro ao salvar conversa ${phone}:`, error);
        throw error;
    }
}
async function getRecentConversations(phone, limit = 20) {
    validatePhone(phone);
    // Clamp limit to reasonable range
    const safeLimit = Math.min(Math.max(1, limit), 100);
    try {
        return await exports.Conversation.find({ phone })
            .sort({ timestamp: -1 })
            .limit(safeLimit)
            .lean();
    }
    catch (error) {
        console.error(`[DB] Erro ao buscar conversas ${phone}:`, error);
        throw error;
    }
}
//# sourceMappingURL=database.js.map