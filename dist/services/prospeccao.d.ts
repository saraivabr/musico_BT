export interface LeadProspeccao {
    id: string;
    phone: string;
    businessName: string;
    category: string;
    rating?: number;
    reviewCount?: number;
    address?: string;
    website?: string;
    source: 'google_maps' | 'manual' | 'indicacao';
    status: 'novo' | 'contactado' | 'respondeu' | 'qualificado' | 'desqualificado' | 'passou_closer';
    followupCount: number;
    lastContactAt?: Date;
    nextFollowupAt?: Date;
    notes?: string;
    createdAt: Date;
}
export interface ProspeccaoContext {
    lead: LeadProspeccao;
    isFirstContact: boolean;
    followupNumber?: number;
    previousMessages?: string[];
}
export declare function gerarPrimeiraMensagem(lead: LeadProspeccao): Promise<string>;
export declare function gerarFollowUp(lead: LeadProspeccao, followupNumber: number): Promise<string>;
export declare function responderProspeccao(lead: LeadProspeccao, mensagemDoLead: string, historicoMensagens?: string[]): Promise<{
    resposta: string;
    acao: 'continuar' | 'qualificado' | 'desqualificado' | 'passar_closer';
}>;
export declare function calcularProximoFollowUp(lead: LeadProspeccao): Date | null;
export declare function deveEnviarFollowUp(lead: LeadProspeccao): boolean;
//# sourceMappingURL=prospeccao.d.ts.map