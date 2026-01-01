interface WebhookPayload {
    event: string;
    charge?: {
        correlationID: string;
        value: number;
        status: string;
    };
    pix?: {
        value: number;
        time: string;
        transactionID: string;
    };
}
/**
 * Cria uma cobrança PIX
 */
export declare function createCharge(valueInCents: number, description: string, correlationId?: string): Promise<{
    chargeId: string;
    correlationId: string;
    pixCode: string;
    qrCodeUrl: string;
    paymentLink: string;
    expiresAt: Date;
}>;
/**
 * Verifica status de uma cobrança
 */
export declare function getChargeStatus(correlationId: string): Promise<{
    status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
    value: number;
    paidAt?: Date;
}>;
/**
 * Processa payload do webhook
 */
export declare function parseWebhookPayload(payload: WebhookPayload): {
    event: string;
    correlationId: string;
    value: number;
    transactionId?: string;
} | null;
/**
 * Valida assinatura do webhook (se configurado)
 */
export declare function validateWebhookSignature(payload: string, signature: string): boolean;
/**
 * Formata valor em centavos para exibição
 */
export declare function formatCurrency(cents: number): string;
/**
 * Pacotes de créditos disponíveis
 */
export declare const CREDIT_PACKAGES: readonly [{
    readonly id: "pack1";
    readonly credits: 1;
    readonly price: 999;
    readonly label: "1 crédito - R$ 9,99";
}, {
    readonly id: "pack5";
    readonly credits: 5;
    readonly price: 3999;
    readonly label: "5 créditos - R$ 39,99 (20% off)";
}, {
    readonly id: "pack10";
    readonly credits: 10;
    readonly price: 6999;
    readonly label: "10 créditos - R$ 69,99 (30% off)";
}];
export type PackageId = typeof CREDIT_PACKAGES[number]['id'];
export declare function getPackageById(id: PackageId): {
    readonly id: "pack1";
    readonly credits: 1;
    readonly price: 999;
    readonly label: "1 crédito - R$ 9,99";
} | {
    readonly id: "pack5";
    readonly credits: 5;
    readonly price: 3999;
    readonly label: "5 créditos - R$ 39,99 (20% off)";
} | {
    readonly id: "pack10";
    readonly credits: 10;
    readonly price: 6999;
    readonly label: "10 créditos - R$ 69,99 (30% off)";
} | undefined;
export {};
//# sourceMappingURL=wooviPix.d.ts.map