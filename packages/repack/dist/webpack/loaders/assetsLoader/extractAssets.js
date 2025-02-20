"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractAssets = extractAssets;
var _path = _interopRequireDefault(require("path"));
var _dedent = _interopRequireDefault(require("dedent"));
var _hasha = _interopRequireDefault(require("hasha"));
var _utils = require("./utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function extractAssets({
  resourcePath,
  resourceDirname,
  resourceFilename,
  resourceExtensionType,
  assets,
  suffixPattern,
  assetsDirname,
  pathSeparatorRegexp,
  publicPath: customPublicPath,
  devServerEnabled
}, logger) {
  let publicPath = _path.default.join(assetsDirname, resourceDirname).replace(pathSeparatorRegexp, '/');
  if (customPublicPath) {
    publicPath = _path.default.join(customPublicPath, publicPath);
  }
  const hashes = await Promise.all(assets.map(asset => _hasha.default.async(asset.content?.toString() ?? asset.filename, {
    algorithm: 'md5'
  })));
  const size = (0, _utils.getImageSize)({
    resourceFilename,
    resourcePath,
    suffixPattern
  });
  logger.debug(`Extracted assets for request ${resourcePath}`, {
    hashes,
    publicPath: customPublicPath,
    height: size?.height,
    width: size?.width
  });
  return (0, _dedent.default)`
    var AssetRegistry = require('react-native/Libraries/Image/AssetRegistry');
    module.exports = AssetRegistry.registerAsset({
      __packager_asset: true,
      scales: ${JSON.stringify(assets.map(asset => asset.scale))},
      name: ${JSON.stringify(resourceFilename)},
      type: ${JSON.stringify(resourceExtensionType)},
      hash: ${JSON.stringify(hashes.join())},
      httpServerLocation: ${JSON.stringify(publicPath)},
      ${devServerEnabled ? `fileSystemLocation: ${JSON.stringify(resourceDirname)},` : ''}
      ${size ? `height: ${size.height},` : ''}
      ${size ? `width: ${size.width},` : ''}
    });
    `;
}
//# sourceMappingURL=extractAssets.js.map