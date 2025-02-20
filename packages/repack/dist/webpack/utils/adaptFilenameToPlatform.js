"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adaptFilenameToPlatform = void 0;
var _os = _interopRequireDefault(require("os"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const isWindows = _os.default.platform() === 'win32';
const adaptFilenameToPlatform = filename => {
  if (isWindows) {
    return filename.replace(/\\/g, '/');
  }
  return filename;
};
exports.adaptFilenameToPlatform = adaptFilenameToPlatform;
//# sourceMappingURL=adaptFilenameToPlatform.js.map