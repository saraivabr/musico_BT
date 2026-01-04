import type { BaileysProvider } from '@builderbot/provider-baileys';
interface Alerta {
    tipo: 'duvida' | 'objecao_nova' | 'lead_quente' | 'erro' | 'bloqueio' | 'feedback' | 'passagem_closer';
    leadPhone?: string;
    leadName?: string;
    mensagemLead?: string;
    contexto: string;
    sugestao?: string;
    urgencia: 'baixa' | 'media' | 'alta';
    timestamp: Date;
}
export declare function inicializarMonitoramento(baileysProvider: BaileysProvider, numerosDono: string[]): Promise<string>;
export declare function enviarAlerta(alerta: Alerta): Promise<boolean>;
export declare function alertarDuvidaNaoRespondida(leadPhone: string, leadName: string | undefined, mensagemLead: string, tentativaResposta: string): Promise<void>;
export declare function alertarObjecaoNova(leadPhone: string, leadName: string | undefined, objecao: string, respostaUsada: string): Promise<void>;
export declare function alertarLeadQuente(leadPhone: string, leadName: string | undefined, motivo: string, ultimaMensagem: string): Promise<void>;
export declare function alertarErro(erro: string, contexto: string, leadPhone?: string): Promise<void>;
export declare function alertarBloqueio(leadPhone: string, leadName: string | undefined, historicoResumido: string): Promise<void>;
export declare function alertarPassagemCloser(leadPhone: string, leadName: string | undefined, resumoQualificacao: string, temperatura: string): Promise<void>;
export declare function alertarFeedback(mensagem: string): Promise<void>;
export declare function enviarRelatorioDiario(stats: {
    conversasNovas: number;
    conversasRespondidas: number;
    leadsQualificados: number;
    leadsDesqualificados: number;
    followupsEnviados: number;
    bloqueios: number;
}): Promise<void>;
export declare function setGrupoId(id: string): void;
export declare function getGrupoId(): string | null;
export {};
//# sourceMappingURL=monitoramento.d.ts.map