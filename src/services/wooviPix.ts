import { config } from '../config'
import { v4 as uuidv4 } from 'uuid'

const API_BASE = 'https://api.openpix.com.br/api/v1'

interface CreateChargeRequest {
  correlationID: string
  value: number           // valor em centavos
  comment?: string
  expiresIn?: number      // segundos até expirar
}

interface ChargeResponse {
  charge: {
    correlationID: string
    value: number
    status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
    brCode: string                    // código copia-cola
    qrCodeImage: string               // URL da imagem QR
    paymentLinkUrl: string            // link de pagamento
    expiresDate: string
    createdAt: string
    identifier: string
    transactionID: string
  }
  correlationID: string
  brCode: string
}

interface WebhookPayload {
  event: string                       // 'OPENPIX_TRANSACTION_RECEIVED'
  charge?: {
    correlationID: string
    value: number
    status: string
  }
  pix?: {
    value: number
    time: string
    transactionID: string
  }
}

async function makeRequest<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: object): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': config.woovi.apiKey,
      'Content-Type': 'application/json'
    }
  }

  if (body && method === 'POST') {
    options.body = JSON.stringify(body)
  }

  console.log(`[WOOVI] ${method} ${endpoint}`)

  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[WOOVI] Erro ${response.status}: ${errorText}`)
    throw new Error(`Woovi API error: ${response.status} - ${errorText}`)
  }

  return response.json() as T
}

/**
 * Cria uma cobrança PIX
 */
export async function createCharge(
  valueInCents: number,
  description: string,
  correlationId?: string
): Promise<{
  chargeId: string
  correlationId: string
  pixCode: string
  qrCodeUrl: string
  paymentLink: string
  expiresAt: Date
}> {
  const id = correlationId || uuidv4()

  const payload: CreateChargeRequest = {
    correlationID: id,
    value: valueInCents,
    comment: description,
    expiresIn: 1800  // 30 minutos
  }

  const response = await makeRequest<ChargeResponse>('/charge', 'POST', payload)

  console.log(`[WOOVI] Cobrança criada: ${response.charge.correlationID} - R$${(valueInCents / 100).toFixed(2)}`)

  return {
    chargeId: response.charge.identifier,
    correlationId: response.charge.correlationID,
    pixCode: response.charge.brCode,
    qrCodeUrl: response.charge.qrCodeImage,
    paymentLink: response.charge.paymentLinkUrl,
    expiresAt: new Date(response.charge.expiresDate)
  }
}

/**
 * Verifica status de uma cobrança
 */
export async function getChargeStatus(correlationId: string): Promise<{
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
  value: number
  paidAt?: Date
}> {
  const response = await makeRequest<{ charge: ChargeResponse['charge'] }>(`/charge/${correlationId}`)

  return {
    status: response.charge.status,
    value: response.charge.value
  }
}

/**
 * Processa payload do webhook
 */
export function parseWebhookPayload(payload: WebhookPayload): {
  event: string
  correlationId: string
  value: number
  transactionId?: string
} | null {
  // Webhook de transação recebida (evento do OpenPix)
  if (payload.event === 'OPENPIX:TRANSACTION_RECEIVED' && payload.charge) {
    return {
      event: payload.event,
      correlationId: payload.charge.correlationID,
      value: payload.charge.value,
      transactionId: payload.pix?.transactionID
    }
  }

  // Outros eventos (status change, etc)
  if (payload.charge?.correlationID) {
    return {
      event: payload.event,
      correlationId: payload.charge.correlationID,
      value: payload.charge.value
    }
  }

  console.warn('[WOOVI] Webhook payload não reconhecido:', payload)
  return null
}

/**
 * Valida assinatura do webhook (se configurado)
 */
export function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!config.woovi.webhookSecret) {
    // Se não configurou secret, aceita tudo
    return true
  }

  // OpenPix usa HMAC SHA256
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', config.woovi.webhookSecret)
    .update(payload)
    .digest('hex')

  return signature === expectedSignature
}

/**
 * Formata valor em centavos para exibição
 */
export function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`
}

/**
 * Pacotes de créditos disponíveis
 */
export const CREDIT_PACKAGES = [
  { id: 'pack1', credits: 1, price: 999, label: '1 crédito - R$ 9,99' },
  { id: 'pack5', credits: 5, price: 3999, label: '5 créditos - R$ 39,99 (20% off)' },
  { id: 'pack10', credits: 10, price: 6999, label: '10 créditos - R$ 69,99 (30% off)' }
] as const

export type PackageId = typeof CREDIT_PACKAGES[number]['id']

export function getPackageById(id: PackageId) {
  return CREDIT_PACKAGES.find(p => p.id === id)
}
