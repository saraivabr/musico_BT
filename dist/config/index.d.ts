interface Config {
    port: number;
    mongodb: {
        uri: string;
    };
    gemini: {
        apiKey: string;
    };
    bot: {
        name: string;
        devocionalHora: string;
    };
}
export declare const config: Config;
export {};
//# sourceMappingURL=index.d.ts.map