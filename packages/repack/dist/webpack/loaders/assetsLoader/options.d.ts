import { validateSchema, LoaderContext } from 'webpack';
export interface Options {
    platform: string;
    scalableAssetExtensions: string[];
    devServerEnabled?: boolean;
    inline?: boolean;
    publicPath?: string;
    remote?: {
        enabled: boolean;
        assetPath?: (args: {
            resourcePath: string;
            resourceFilename: string;
            resourceDirname: string;
            resourceExtensionType: string;
        }) => string;
        publicPath: string;
    };
}
type Schema = Parameters<typeof validateSchema>[0];
export declare const optionsSchema: Schema;
export declare function getOptions(loaderContext: LoaderContext<Options>): Options;
export {};
