export type Intent = 'devocional' | 'quiz' | 'oracao' | 'aconselhamento' | 'evangelismo' | 'busca_biblica' | 'midia' | 'comunidade' | 'indicacao' | 'plano_leitura' | 'conversa_livre' | 'saudacao' | 'menu';
export declare function detectIntent(message: string): Intent;
export declare function isCrisis(message: string): boolean;
//# sourceMappingURL=intentDetector.d.ts.map