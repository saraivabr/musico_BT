interface Config {
    port: number;
    mongodb: {
        uri: string;
    };
    openai: {
        apiKey: string;
    };
    suno: {
        apiKey: string;
        apiUrl: string;
        callbackUrl: string;
        costPerSong: number;
    };
    woovi: {
        apiKey: string;
        webhookSecret?: string;
    };
    r2: {
        accountId: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucketName: string;
        publicUrl: string;
    };
    bot: {
        name: string;
        baseUrl: string;
        adminPhone: string;
    };
    pricing: {
        pack1: {
            credits: number;
            price: number;
        };
        pack5: {
            credits: number;
            price: number;
        };
        pack10: {
            credits: number;
            price: number;
        };
    };
}
export declare const config: Config;
export {};
//# sourceMappingURL=index.d.ts.map