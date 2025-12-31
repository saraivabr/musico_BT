"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPrayerRequest = addPrayerRequest;
exports.getPrayerRequests = getPrayerRequests;
exports.markPrayerAnswered = markPrayerAnswered;
const uuid_1 = require("uuid");
const database_1 = require("../../services/database");
const gemini_1 = require("../../services/gemini");
async function addPrayerRequest(phone, request) {
    const user = await database_1.User.findOne({ phone });
    if (!user)
        throw new Error('Usuario nao encontrado');
    const prayerRequest = {
        id: (0, uuid_1.v4)(),
        request,
        createdAt: new Date(),
        status: 'active',
        followUpSent: false
    };
    user.prayerRequests.push(prayerRequest);
    await user.save();
    return await (0, gemini_1.generatePrayer)(request, user.name);
}
async function getPrayerRequests(phone) {
    const user = await database_1.User.findOne({ phone });
    if (!user)
        return [];
    return user.prayerRequests
        .filter(r => r.status === 'active')
        .map(r => ({ id: r.id, request: r.request, createdAt: r.createdAt }));
}
async function markPrayerAnswered(phone, prayerId) {
    const user = await database_1.User.findOne({ phone });
    if (!user)
        return;
    const prayer = user.prayerRequests.find(r => r.id === prayerId);
    if (prayer) {
        prayer.status = 'answered';
        await user.save();
    }
}
//# sourceMappingURL=prayerManager.js.map