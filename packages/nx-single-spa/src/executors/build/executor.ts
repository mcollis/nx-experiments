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
  context: ExecutorContext
) {
  console.log(context.configurationName);
  console.log(options);
  const normalizedOptions = normalizeWebBuildOptions(context.root, options);
  const config = buildWebpackConfig(normalizedOptions, context);

  return runWebpack(config).then((stats) => ({
    success: !stats.hasErrors(),
    stats: stats.toString(config.stats),
  }));
}
