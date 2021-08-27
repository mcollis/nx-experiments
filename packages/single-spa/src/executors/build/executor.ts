/* eslint-disable @typescript-eslint/no-var-requires */
import type { ExecutorContext } from '@nrwl/devkit';
import { BuildExecutorSchema } from './schema';
import { promisify } from 'util';
import { normalizeWebBuildOptions } from '../../utils/normalize';
import buildWebpackConfig from '../../utils/buildWebpackConfig';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { webpack } = require('@nrwl/web/src/webpack/entry');

const runWebpack = promisify(webpack);

export default async function runExecutor(
  options: BuildExecutorSchema,
  { root }: ExecutorContext
) {
  const normalizedOptions = normalizeWebBuildOptions(root, options);
  const config = buildWebpackConfig(normalizedOptions);

  return runWebpack(config).then((stats) => ({
    success: !stats.hasErrors(),
    stats: stats.toString(config.stats),
  }));
}
