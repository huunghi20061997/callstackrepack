import webpack from 'webpack';
import { WebpackPlugin } from '../../../types';
import type { DestinationSpec, OutputPluginConfig } from './types';
/**
 * Plugin for copying generated files (bundle, chunks, assets) from Webpack's built location to the
 * React Native application directory, so that the files can be packed together into the `ipa`/`apk`.
 *
 * @category Webpack Plugin
 */
export declare class OutputPlugin implements WebpackPlugin {
    private config;
    localSpecs: DestinationSpec[];
    remoteSpecs: DestinationSpec[];
    constructor(config: OutputPluginConfig);
    matchChunkToSpecs(chunk: webpack.StatsChunk, specs: DestinationSpec[]): DestinationSpec[];
    getRelatedSourceMap(chunk: webpack.StatsChunk): string | undefined;
    ensureAbsolutePath(filePath: string): string;
    classifyChunks({ chunks, entryOptions, }: {
        chunks: webpack.StatsChunk[];
        entryOptions: webpack.EntryNormalized;
    }): {
        localChunks: Set<webpack.StatsChunk>;
        remoteChunks: Set<webpack.StatsChunk>;
    };
    /**
     * Apply the plugin.
     *
     * @param compiler Webpack compiler instance.
     */
    apply(compiler: webpack.Compiler): void;
}
