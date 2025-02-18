import path from 'node:path';
import fs from 'node:fs';
import { globby } from 'globby';
import { describe, it, afterEach, beforeAll, expect } from 'vitest';
import commands from '@callstack/repack/commands';

const [bundle] = commands;
type Config = Parameters<typeof bundle.func>[1];
type Args = Parameters<typeof bundle.func>[2];

const TMP_DIR = path.join(__dirname, 'out/bundle-test-output');
const REACT_NATIVE_PATH = require.resolve('react-native', {
  paths: [path.dirname(__dirname)],
});
const RELATIVE_REACT_NATIVE_PATH = path.relative(
  path.join(__dirname, '..', '..', '..'),
  path.dirname(REACT_NATIVE_PATH)
);
const REACT_NATIVE_ANDROID_ASSET_PATH = RELATIVE_REACT_NATIVE_PATH.replaceAll(
  path.sep,
  '_'
).replaceAll(/[-.@+=]/g, '');

describe('bundle command', () => {
  it("should be also available under 'webpack-bundle' alias", () => {
    const bundleCommand = commands.find((command) => command.name === 'bundle');
    const webpackBundleCommand = commands.find(
      (command) => command.name === 'webpack-bundle'
    );

    expect(bundleCommand).toBeDefined();
    expect(webpackBundleCommand).toBeDefined();
    expect(bundleCommand!.func).toEqual(webpackBundleCommand!.func);
  });

  describe.each([
    {
      platform: 'ios',
      assets: [
        'index.bundle',
        'index.bundle.map',
        'miniapp.chunk.bundle',
        'miniapp.chunk.bundle.map',
        'remote.chunk.bundle',
        'remote.chunk.bundle.map',
        'src_asyncChunks_Async_local_tsx.chunk.bundle',
        'src_asyncChunks_Async_local_tsx.chunk.bundle.map',
        'react-native-bundle-output/main.jsbundle',
        'react-native-bundle-output/main.jsbundle.map',
        'react-native-bundle-output/src_asyncChunks_Async_local_tsx.chunk.bundle',
        'react-native-bundle-output/src_asyncChunks_Async_local_tsx.chunk.bundle.map',
        'assets/src/miniapp/callstack-dark.png',
        `assets/${RELATIVE_REACT_NATIVE_PATH}/Libraries/NewAppScreen/components/logo.png`,
        'assets/src/assetsTest/localAssets/webpack.png',
        'assets/src/assetsTest/localAssets/webpack@2x.png',
        'assets/src/assetsTest/localAssets/webpack@3x.png',
        'remote-assets/assets/src/assetsTest/remoteAssets/webpack.png',
        'remote-assets/assets/src/assetsTest/remoteAssets/webpack@2x.png',
        'remote-assets/assets/src/assetsTest/remoteAssets/webpack@3x.png',
        'react-native-bundle-output/assets/src/assetsTest/localAssets/webpack.png',
        'react-native-bundle-output/assets/src/assetsTest/localAssets/webpack@2x.png',
        'react-native-bundle-output/assets/src/assetsTest/localAssets/webpack@3x.png',
        `react-native-bundle-output/assets/${RELATIVE_REACT_NATIVE_PATH}/Libraries/NewAppScreen/components/logo.png`,
      ],
    },
    {
      platform: 'android',
      assets: [
        'index.bundle',
        'index.bundle.map',
        'miniapp.chunk.bundle',
        'miniapp.chunk.bundle.map',
        'remote.chunk.bundle',
        'remote.chunk.bundle.map',
        'src_asyncChunks_Async_local_tsx.chunk.bundle',
        'src_asyncChunks_Async_local_tsx.chunk.bundle.map',
        `drawable-mdpi/${REACT_NATIVE_ANDROID_ASSET_PATH}_libraries_newappscreen_components_logo.png`,
        'drawable-mdpi/src_assetstest_localassets_webpack.png',
        'drawable-xxhdpi/src_assetstest_localassets_webpack.png',
        'drawable-xhdpi/src_assetstest_localassets_webpack.png',
        'drawable-mdpi/src_miniapp_callstackdark.png',
        'react-native-bundle-output/index.android.bundle',
        'react-native-bundle-output/index.android.bundle.map',
        'react-native-bundle-output/src_asyncChunks_Async_local_tsx.chunk.bundle',
        'react-native-bundle-output/src_asyncChunks_Async_local_tsx.chunk.bundle.map',
        `react-native-bundle-output/drawable-mdpi/${REACT_NATIVE_ANDROID_ASSET_PATH}_libraries_newappscreen_components_logo.png`,
        'react-native-bundle-output/drawable-mdpi/src_assetstest_localassets_webpack.png',
        'react-native-bundle-output/drawable-xxhdpi/src_assetstest_localassets_webpack.png',
        'react-native-bundle-output/drawable-xhdpi/src_assetstest_localassets_webpack.png',
        'remote-assets/assets/src/assetsTest/remoteAssets/webpack.png',
        'remote-assets/assets/src/assetsTest/remoteAssets/webpack@2x.png',
        'remote-assets/assets/src/assetsTest/remoteAssets/webpack@3x.png',
      ],
    },
  ])('should successfully produce bundle assets', ({ platform, assets }) => {
    beforeAll(async () => {
      await fs.promises.rm(TMP_DIR, {
        recursive: true,
        force: true,
      });
    });

    afterEach(() => {
      delete process.env.TEST_WEBPACK_OUTPUT_PATH;
    });

    it(
      `for ${platform}`,
      async () => {
        const OUTPUT_DIR = path.join(TMP_DIR, platform);
        const config = {
          root: path.join(__dirname, '..'),
          reactNativePath: path.join(__dirname, '../node_modules/react-native'),
        };
        const args = {
          platform,
          entryFile: 'index.js',
          bundleOutput: path.join(
            OUTPUT_DIR,
            'react-native-bundle-output',
            platform === 'ios' ? 'main.jsbundle' : `index.${platform}.bundle`
          ),
          dev: false,
          webpackConfig: path.join(__dirname, 'configs', 'webpack.config.mjs'),
        };
        process.env.TEST_WEBPACK_OUTPUT_DIR = OUTPUT_DIR;

        await bundle.func([''], config as Config, args as Args);

        const files = await globby([`**/*`], { cwd: OUTPUT_DIR, dot: true });
        expect(files.sort()).toEqual(assets.sort());
      },
      60 * 1000
    );
  });
});
