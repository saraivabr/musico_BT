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
exports.User = void 0;
exports.connectDB = connectDB;
exports.getOrCreateUser = getOrCreateUser;
exports.updateUser = updateUser;
exports.getUserByPhone = getUserByPhone;
exports.addCredits = addCredits;
exports.deductCredit = deductCredit;
exports.getCredits = getCredits;
exports.addPurchase = addPurchase;
exports.updatePurchaseStatus = updatePurchaseStatus;
exports.findPurchaseByCorrelationId = findPurchaseByCorrelationId;
exports.confirmPurchaseAndAddCredits = confirmPurchaseAndAddCredits;
exports.addMusic = addMusic;
exports.updateMusicStatus = updateMusicStatus;
exports.getUserMusics = getUserMusics;
exports.findMusicByTaskId = findMusicByTaskId;
exports.getUserStats = getUserStats;
const mongoose_1 = __importStar(require("mongoose"));
const config_1 = require("../config");
// Purchase Sub-Schema
const purchaseSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    amount: { type: Number, required: true },
    credits: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'expired'], default: 'pending' },
    pixCode: { type: String, required: true },
    pixQrCodeBase64: String,
    chargeId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    paidAt: Date,
    expiresAt: { type: Date, required: true }
}, { _id: false });
// Music Sub-Schema
const musicSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    prompt: { type: String, required: true },
    style: { type: String, required: true },
    isCustomLyrics: { type: Boolean, default: false },
    generatedLyrics: String,
    status: { type: String, enum: ['generating', 'ready', 'failed'], default: 'generating' },
    sunoTaskId: { type: String, required: true },
    audioUrl: String,
    videoUrl: String,
    downloadUrl: String,
    title: String,
    createdAt: { type: Date, default: Date.now },
    completedAt: Date,
    errorMessage: String
}, { _id: false });
// User Schema
const userSchema = new mongoose_1.Schema({
    phone: { type: String, required: true, unique: true, index: true },
    name: String,
    createdAt: { type: Date, default: Date.now },
    lastInteraction: { type: Date, default: Date.now },
    credits: { type: Number, default: 0 },
    purchases: [purchaseSchema],
    musics: [musicSchema],
    stats: {
        totalMusicsCreated: { type: Number, default: 0 },
        totalCreditsSpent: { type: Number, default: 0 },
        totalAmountPaid: { type: Number, default: 0 }
    }
});
exports.User = mongoose_1.default.model('User', userSchema);
// ==================== Helpers ====================
function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') {
        throw new Error('Phone number is required');
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
        throw new Error('Invalid phone number format');
    }
}
// ==================== Connection ====================
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
// ==================== User Operations ====================
async function getOrCreateUser(phone) {
    validatePhone(phone);
    try {
        let user = await exports.User.findOne({ phone });
        if (!user) {
            user = await exports.User.create({
                phone,
                credits: 0,
                purchases: [],
                musics: [],
                stats: {
                    totalMusicsCreated: 0,
                    totalCreditsSpent: 0,
                    totalAmountPaid: 0
                }
            });
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
async function getUserByPhone(phone) {
    validatePhone(phone);
    return exports.User.findOne({ phone });
}
// ==================== Credit Operations ====================
async function addCredits(phone, credits) {
    validatePhone(phone);
    try {
        const user = await exports.User.findOneAndUpdate({ phone }, {
            $inc: { credits: credits },
            lastInteraction: new Date()
        }, { new: true });
        console.log(`[DB] +${credits} créditos para ${phone}. Total: ${user?.credits}`);
        return user;
    }
    catch (error) {
        console.error(`[DB] Erro ao adicionar créditos ${phone}:`, error);
        throw error;
    }
}
async function deductCredit(phone) {
    validatePhone(phone);
    try {
        const result = await exports.User.findOneAndUpdate({ phone, credits: { $gte: 1 } }, {
            $inc: {
                credits: -1,
                'stats.totalCreditsSpent': 1
            },
            lastInteraction: new Date()
        }, { new: true });
        if (!result) {
            console.log(`[DB] Créditos insuficientes para ${phone}`);
            return false;
        }
        console.log(`[DB] -1 crédito de ${phone}. Restam: ${result.credits}`);
        return true;
    }
    catch (error) {
        console.error(`[DB] Erro ao debitar crédito ${phone}:`, error);
        throw error;
    }
}
async function getCredits(phone) {
    const user = await getUserByPhone(phone);
    return user?.credits || 0;
}
// ==================== Purchase Operations ====================
async function addPurchase(phone, purchase) {
    validatePhone(phone);
    try {
        const user = await exports.User.findOneAndUpdate({ phone }, {
            $push: { purchases: purchase },
            lastInteraction: new Date()
        }, { new: true });
        console.log(`[DB] Nova compra ${purchase.id} para ${phone}`);
        return user;
    }
    catch (error) {
        console.error(`[DB] Erro ao adicionar compra ${phone}:`, error);
        throw error;
    }
}
async function updatePurchaseStatus(phone, purchaseId, status, paidAt) {
    validatePhone(phone);
    try {
        const updateData = {
            'purchases.$.status': status,
            lastInteraction: new Date()
        };
        if (paidAt) {
            updateData['purchases.$.paidAt'] = paidAt;
        }
        const user = await exports.User.findOneAndUpdate({ phone, 'purchases.id': purchaseId }, { $set: updateData }, { new: true });
        console.log(`[DB] Compra ${purchaseId} atualizada: ${status}`);
        return user;
    }
    catch (error) {
        console.error(`[DB] Erro ao atualizar compra ${phone}:`, error);
        throw error;
    }
}
async function findPurchaseByCorrelationId(correlationId) {
    try {
        const user = await exports.User.findOne({ 'purchases.id': correlationId });
        if (!user)
            return null;
        const purchase = user.purchases.find(p => p.id === correlationId);
        if (!purchase)
            return null;
        return { phone: user.phone, purchase };
    }
    catch (error) {
        console.error(`[DB] Erro ao buscar compra ${correlationId}:`, error);
        throw error;
    }
}
async function confirmPurchaseAndAddCredits(correlationId) {
    try {
        const result = await findPurchaseByCorrelationId(correlationId);
        if (!result) {
            console.warn(`[DB] Compra não encontrada: ${correlationId}`);
            return null;
        }
        const { phone, purchase } = result;
        if (purchase.status === 'paid') {
            console.log(`[DB] Compra ${correlationId} já confirmada`);
            return { phone, credits: purchase.credits };
        }
        // Atualiza status e adiciona créditos
        await exports.User.findOneAndUpdate({ phone, 'purchases.id': correlationId }, {
            $set: {
                'purchases.$.status': 'paid',
                'purchases.$.paidAt': new Date()
            },
            $inc: {
                credits: purchase.credits,
                'stats.totalAmountPaid': purchase.amount
            },
            lastInteraction: new Date()
        });
        console.log(`[DB] Compra ${correlationId} confirmada. +${purchase.credits} créditos para ${phone}`);
        return { phone, credits: purchase.credits };
    }
    catch (error) {
        console.error(`[DB] Erro ao confirmar compra ${correlationId}:`, error);
        throw error;
    }
}
// ==================== Music Operations ====================
async function addMusic(phone, music) {
    validatePhone(phone);
    try {
        const user = await exports.User.findOneAndUpdate({ phone }, {
            $push: { musics: music },
            $inc: { 'stats.totalMusicsCreated': 1 },
            lastInteraction: new Date()
        }, { new: true });
        console.log(`[DB] Nova música ${music.id} para ${phone}`);
        return user;
    }
    catch (error) {
        console.error(`[DB] Erro ao adicionar música ${phone}:`, error);
        throw error;
    }
}
async function updateMusicStatus(phone, musicId, updates) {
    validatePhone(phone);
    try {
        const setUpdates = { lastInteraction: new Date() };
        for (const [key, value] of Object.entries(updates)) {
            setUpdates[`musics.$.${key}`] = value;
        }
        const user = await exports.User.findOneAndUpdate({ phone, 'musics.id': musicId }, { $set: setUpdates }, { new: true });
        console.log(`[DB] Música ${musicId} atualizada`);
        return user;
    }
    catch (error) {
        console.error(`[DB] Erro ao atualizar música ${phone}:`, error);
        throw error;
    }
}
async function getUserMusics(phone, limit = 10) {
    validatePhone(phone);
    const user = await getUserByPhone(phone);
    if (!user)
        return [];
    return user.musics
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
}
async function findMusicByTaskId(taskId) {
    try {
        const user = await exports.User.findOne({ 'musics.sunoTaskId': taskId });
        if (!user)
            return null;
        const music = user.musics.find(m => m.sunoTaskId === taskId);
        if (!music)
            return null;
        return { phone: user.phone, music };
    }
    catch (error) {
        console.error(`[DB] Erro ao buscar música por taskId ${taskId}:`, error);
        throw error;
    }
}
// ==================== Stats ====================
async function getUserStats(phone) {
    const user = await getUserByPhone(phone);
    return user?.stats || null;
}
//# sourceMappingURL=database.js.map