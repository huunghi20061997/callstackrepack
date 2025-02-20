"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInitializationEntries = getInitializationEntries;
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * {@link getInitializationEntries} options.
 */

/**
 * Get setup and initialization entires for Webpack configuration's `entry` field.
 * The returned entires should be added before your project entry.
 *
 * @param reactNativePath Absolute path to directory with React Native dependency.
 * @param options Additional options that can modify returned entires.
 * @returns Array of entires.
 *
 * @category Webpack util
 *
 * @example Usage in Webpack config:
 * ```ts
 * import * as Repack from '@callstack/repack';
 *
 * const { resolve } = createRequire(import.meta.url);
 *
 * export default (env) => {
 *   const {
 *     devServer,
 *     reactNativePath = resolve('react-native'),
 *   } = env;
 *
 *   return {
 *     entry: [
 *       ...Repack.getInitializationEntries(reactNativePath, {
 *         hmr: devServer && devServer.hmr,
 *       }),
 *       entry,
 *     ],
 *   };
 * };
 * ```
 */
function getInitializationEntries(reactNativePath, options = {}) {
  const {
    initializeCoreLocation,
    hmr
  } = options;
  const getPolyfills = require(_path.default.join(reactNativePath, 'rn-get-polyfills.js'));
  const entries = [...getPolyfills(), initializeCoreLocation || _path.default.join(reactNativePath, 'Libraries/Core/InitializeCore.js'), require.resolve('../../modules/configurePublicPath')];
  if (hmr) {
    entries.push(require.resolve('../../modules/WebpackHMRClient'));
  }
  return entries;
}
//# sourceMappingURL=getInitializationEntries.js.map