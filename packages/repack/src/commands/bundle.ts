import { pipeline } from 'node:stream/promises';
import { Config } from '@react-native-community/cli-types';
import fs from 'fs-extra';
import { stringifyStream } from '@discoveryjs/json-ext';
import webpack from 'webpack';
import { VERBOSE_ENV_KEY } from '../env';
import { BundleArguments, CliOptions } from '../types';
import { loadWebpackConfig } from '../webpack/loadWebpackConfig';
import { getWebpackEnvOptions } from '../webpack/utils';
import { getWebpackConfigPath } from './utils/getWebpackConfigPath';

/**
 * Bundle command for React Native CLI.
 * It runs Webpack, builds bundle and saves it alongside any other assets and Source Map
 * to filesystem.
 *
 * @param _ Original, non-parsed arguments that were provided when running this command.
 * @param config React Native CLI configuration object.
 * @param args Parsed command line arguments.
 *
 * @internal
 * @category CLI command
 */
export async function bundle(
  _: string[],
  config: Config,
  args: BundleArguments
) {
  const webpackConfigPath = getWebpackConfigPath(
    config.root,
    args.webpackConfig
  );

  const cliOptions = {
    config: {
      root: config.root,
      reactNativePath: config.reactNativePath,
      webpackConfigPath,
    },
    command: 'bundle',
    arguments: {
      bundle: args,
    },
  } as CliOptions;

  if (!args.entryFile) {
    throw new Error("Option '--entry-file <path>' argument is missing");
  }

  if (args.verbose ?? process.argv.includes('--verbose')) {
    process.env[VERBOSE_ENV_KEY] = '1';
  }

  const webpackEnvOptions = getWebpackEnvOptions(cliOptions);
  const webpackConfig = await loadWebpackConfig(
    webpackConfigPath,
    webpackEnvOptions
  );

  const errorHandler = async (error: Error | null, stats?: webpack.Stats) => {
    if (error) {
      console.error(error);
      process.exit(2);
    }

    if (stats?.hasErrors()) {
      stats.compilation?.errors?.forEach((e) => {
        console.error(e);
      });
      process.exit(2);
    }

    if (args.json && stats !== undefined) {
      console.log(`Writing compiler stats`);

      let statOptions: Parameters<typeof stats.toJson>[0];
      if (args.stats !== undefined) {
        statOptions = { preset: args.stats };
      } else if (typeof compiler.options.stats === 'boolean') {
        statOptions = compiler.options.stats
          ? { preset: 'normal' }
          : { preset: 'none' };
      } else {
        statOptions = compiler.options.stats;
      }

      try {
        // Stats can be fairly big at which point their JSON no longer fits into a single string.
        // Approach was copied from `webpack-cli`: https://github.com/webpack/webpack-cli/blob/c03fb03d0aa73d21f16bd9263fd3109efaf0cd28/packages/webpack-cli/src/webpack-cli.ts#L2471-L2482
        const statsStream = stringifyStream(stats.toJson(statOptions));
        const outputStream = fs.createWriteStream(args.json);
        await pipeline(statsStream, outputStream);
        console.log(`Wrote compiler stats to ${args.json}`);
      } catch (error) {
        console.error(error);
        process.exit(2);
      }
    }
  };

  const compiler = webpack(webpackConfig);

  return new Promise<void>((resolve) => {
    if (args.watch) {
      compiler.hooks.watchClose.tap('bundle', resolve);
      compiler.watch(webpackConfig.watchOptions ?? {}, errorHandler);
    } else {
      compiler.run((error, stats) => {
        // make cache work: https://webpack.js.org/api/node/#run
        compiler.close(async (closeErr) => {
          if (closeErr) console.error(closeErr);
          await errorHandler(error, stats);
          resolve();
        });
      });
    }
  });
}
