import { type allowedMethods, type AppCTX } from "./primitives/types.js";
export declare class JetPath {
    server: any;
    private listening;
    private options;
    constructor(options?: {
        documentation?: {
            name?: string;
            info?: string;
            color?: string;
            logo?: string;
        };
        sources: Record<string, any>;
        credentials?: any;
        displayRoutes?: "UI";
        cors?: {
            allowMethods?: allowedMethods;
            secureContext?: boolean;
            allowHeaders?: string[];
            exposeHeaders?: string[];
            keepHeadersOnError?: boolean;
            maxAge?: string;
            credentials?: boolean;
            privateNetworkAccess?: any;
            origin?: string;
        } | boolean;
    });
    decorate(decorations: Record<string, (ctx: AppCTX) => void>): void;
    listen(): Promise<void>;
}
export type { AppCTX, Schema } from "./primitives/types.js";
