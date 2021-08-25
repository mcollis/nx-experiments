/* eslint-disable @typescript-eslint/no-var-requires */
import type { ExecutorContext } from '@nrwl/devkit';
import { BuildExecutorSchema } from './schema';
import { promisify } from 'util';
import { resolve } from 'path';
import { merge } from 'webpack-merge';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { webpack } = require('@nrwl/web/src/webpack/entry');

const runWebpack = promisify(webpack);

export default async function runExecutor(
  options: BuildExecutorSchema,
  { root }: ExecutorContext
) {
  const singleSpaConfig = require('../../plugins/webpack.config.js')(
    {},
    { options: { ...options, filename: resolve(root, options.filename) } }
  );
  const projectConfig = options.webpackConfig
    ? require(resolve(root, options.webpackConfig))
    : {};

  const config = merge(singleSpaConfig, projectConfig);

  console.log(config);

  return (
    runWebpack(config)
      // .then(R.tap(console.log))
      .then((result) => {
        console.log('Executor ran for Build', options);
        return {
          success: true,
        };
      })
  );
}
