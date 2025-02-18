import fs from 'fs';
import path from 'path';
import semver, { SemVer } from 'semver';

import logger from '../utils/logger.js';

/**
 * Checks whether React-Native is installed and returns it's version
 *
 * @param cwd current working directory
 * @returns React-Native version
 */
export default function checkReactNative(rootDir: string): SemVer {
  const packageJsonPath = path.join(rootDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  if (!packageJson?.dependencies['react-native']) {
    logger.error('React-Native not found in package.json');
    throw new Error('React-Native not found in package.json');
  }

  const version = semver.coerce(packageJson.dependencies['react-native']);

  if (!version) {
    throw new Error('Failed to parse React-Native version');
  }

  logger.info(`Found React-Native@${version} in package.json`);

  if (semver.minor(version) < 69) {
    logger.warn('Re.Pack officially supports React-Native >= 0.69.0');
    logger.warn(
      'You can still use Re.Pack with older versions of React-Native, but you might encounter some issues.'
    );
  }

  return version;
}
