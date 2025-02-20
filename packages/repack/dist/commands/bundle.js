"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bundle = bundle;
var _promises = require("node:stream/promises");
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _jsonExt = require("@discoveryjs/json-ext");
var _webpack = _interopRequireDefault(require("webpack"));
var _env = require("../env");
var _loadWebpackConfig = require("../webpack/loadWebpackConfig");
var _utils = require("../webpack/utils");
var _getWebpackConfigPath = require("./utils/getWebpackConfigPath");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
async function bundle(_, config, args) {
  const webpackConfigPath = (0, _getWebpackConfigPath.getWebpackConfigPath)(config.root, args.webpackConfig);
  const cliOptions = {
    config: {
      root: config.root,
      reactNativePath: config.reactNativePath,
      webpackConfigPath
    },
    command: 'bundle',
    arguments: {
      bundle: args
    }
  };
  if (!args.entryFile) {
    throw new Error("Option '--entry-file <path>' argument is missing");
  }
  if (args.verbose ?? process.argv.includes('--verbose')) {
    process.env[_env.VERBOSE_ENV_KEY] = '1';
  }
  const webpackEnvOptions = (0, _utils.getWebpackEnvOptions)(cliOptions);
  const webpackConfig = await (0, _loadWebpackConfig.loadWebpackConfig)(webpackConfigPath, webpackEnvOptions);
  const errorHandler = async (error, stats) => {
    if (error) {
      console.error(error);
      process.exit(2);
    }
    if (stats?.hasErrors()) {
      stats.compilation?.errors?.forEach(e => {
        console.error(e);
      });
      process.exit(2);
    }
    if (args.json && stats !== undefined) {
      console.log(`Writing compiler stats`);
      let statOptions;
      if (args.stats !== undefined) {
        statOptions = {
          preset: args.stats
        };
      } else if (typeof compiler.options.stats === 'boolean') {
        statOptions = compiler.options.stats ? {
          preset: 'normal'
        } : {
          preset: 'none'
        };
      } else {
        statOptions = compiler.options.stats;
      }
      try {
        // Stats can be fairly big at which point their JSON no longer fits into a single string.
        // Approach was copied from `webpack-cli`: https://github.com/webpack/webpack-cli/blob/c03fb03d0aa73d21f16bd9263fd3109efaf0cd28/packages/webpack-cli/src/webpack-cli.ts#L2471-L2482
        const statsStream = (0, _jsonExt.stringifyStream)(stats.toJson(statOptions));
        const outputStream = _fsExtra.default.createWriteStream(args.json);
        await (0, _promises.pipeline)(statsStream, outputStream);
        console.log(`Wrote compiler stats to ${args.json}`);
      } catch (error) {
        console.error(error);
        process.exit(2);
      }
    }
  };
  const compiler = (0, _webpack.default)(webpackConfig);
  return new Promise(resolve => {
    if (args.watch) {
      compiler.hooks.watchClose.tap('bundle', resolve);
      compiler.watch(webpackConfig.watchOptions ?? {}, errorHandler);
    } else {
      compiler.run((error, stats) => {
        // make cache work: https://webpack.js.org/api/node/#run
        compiler.close(async closeErr => {
          if (closeErr) console.error(closeErr);
          await errorHandler(error, stats);
          resolve();
        });
      });
    }
  });
}
//# sourceMappingURL=bundle.js.map