"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREDIT_PACKAGES = void 0;
exports.createCharge = createCharge;
exports.getChargeStatus = getChargeStatus;
exports.parseWebhookPayload = parseWebhookPayload;
exports.validateWebhookSignature = validateWebhookSignature;
exports.formatCurrency = formatCurrency;
exports.getPackageById = getPackageById;
const config_1 = require("../config");
const uuid_1 = require("uuid");
const API_BASE = 'https://api.openpix.com.br/api/v1';
async function makeRequest(endpoint, method = 'GET', body) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
        method,
        headers: {
            'Authorization': config_1.config.woovi.apiKey,
            'Content-Type': 'application/json'
        }
    };
    if (body && method === 'POST') {
        options.body = JSON.stringify(body);
    }
    console.log(`[WOOVI] ${method} ${endpoint}`);
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[WOOVI] Erro ${response.status}: ${errorText}`);
        throw new Error(`Woovi API error: ${response.status} - ${errorText}`);
    }
    return response.json();
}
/**
 * Cria uma cobrança PIX
 */
async function createCharge(valueInCents, description, correlationId) {
    const id = correlationId || (0, uuid_1.v4)();
    const payload = {
        correlationID: id,
        value: valueInCents,
        comment: description,
        expiresIn: 1800 // 30 minutos
    };
    const response = await makeRequest('/charge', 'POST', payload);
    console.log(`[WOOVI] Cobrança criada: ${response.charge.correlationID} - R$${(valueInCents / 100).toFixed(2)}`);
    return {
        chargeId: response.charge.identifier,
        correlationId: response.charge.correlationID,
        pixCode: response.charge.brCode,
        qrCodeUrl: response.charge.qrCodeImage,
        paymentLink: response.charge.paymentLinkUrl,
        expiresAt: new Date(response.charge.expiresDate)
    };
}
/**
 * Verifica status de uma cobrança
 */
async function getChargeStatus(correlationId) {
    const response = await makeRequest(`/charge/${correlationId}`);
    return {
        status: response.charge.status,
        value: response.charge.value
    };
}
/**
 * Processa payload do webhook
 */
function parseWebhookPayload(payload) {
    // Webhook de transação recebida (evento do OpenPix)
    if (payload.event === 'OPENPIX:TRANSACTION_RECEIVED' && payload.charge) {
        return {
            event: payload.event,
            correlationId: payload.charge.correlationID,
            value: payload.charge.value,
            transactionId: payload.pix?.transactionID
        };
    }
    // Outros eventos (status change, etc)
    if (payload.charge?.correlationID) {
        return {
            event: payload.event,
            correlationId: payload.charge.correlationID,
            value: payload.charge.value
        };
    }
    console.warn('[WOOVI] Webhook payload não reconhecido:', payload);
    return null;
}
/**
 * Valida assinatura do webhook (se configurado)
 */
function validateWebhookSignature(payload, signature) {
    if (!config_1.config.woovi.webhookSecret) {
        // Se não configurou secret, aceita tudo
        return true;
    }
    // OpenPix usa HMAC SHA256
    const crypto = require('crypto');
    const expectedSignature = crypto
        .createHmac('sha256', config_1.config.woovi.webhookSecret)
        .update(payload)
        .digest('hex');
    return signature === expectedSignature;
}
/**
 * Formata valor em centavos para exibição
 */
function formatCurrency(cents) {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}
/**
 * Pacotes de créditos disponíveis
 */
exports.CREDIT_PACKAGES = [
    { id: 'pack1', credits: 1, price: 999, label: '1 crédito - R$ 9,99' },
    { id: 'pack5', credits: 5, price: 3999, label: '5 créditos - R$ 39,99 (20% off)' },
    { id: 'pack10', credits: 10, price: 6999, label: '10 créditos - R$ 69,99 (30% off)' }
];
function getPackageById(id) {
    return exports.CREDIT_PACKAGES.find(p => p.id === id);
}
//# sourceMappingURL=wooviPix.js.map