"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWebpackConfigPath = getWebpackConfigPath;
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodeOs = _interopRequireDefault(require("node:os"));
var _nodeUrl = _interopRequireDefault(require("node:url"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Supports the same files as Webpack CLI.
const DEFAULT_WEBPACK_CONFIG_LOCATIONS = ['webpack.config.mjs', 'webpack.config.cjs', 'webpack.config.js', '.webpack/webpack.config.mjs', '.webpack/webpack.config.cjs', '.webpack/webpack.config.js', '.webpack/webpackfile'];
function getWebpackConfigPath(root, customPath) {
  const candidates = customPath ? [customPath] : DEFAULT_WEBPACK_CONFIG_LOCATIONS;
  for (const candidate of candidates) {
    const filename = _nodePath.default.isAbsolute(candidate) ? candidate : _nodePath.default.join(root, candidate);
    if (_nodeFs.default.existsSync(filename)) {
      if (_nodePath.default.extname(filename) === '.mjs' && _nodeOs.default.platform() === 'win32') {
        return _nodeUrl.default.pathToFileURL(filename).href;
      } else {
        return filename;
      }
    }
  }
  throw new Error('Cannot find Webpack configuration file');
}
//# sourceMappingURL=getWebpackConfigPath.js.map