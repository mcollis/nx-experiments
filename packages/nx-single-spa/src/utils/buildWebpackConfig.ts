/* eslint-disable @typescript-eslint/no-var-requires */
import { ExecutorContext } from '@nrwl/devkit';
import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import { WebpackBuildSchema } from './normalize';

export default function buildWebpackConfig(
  options: WebpackBuildSchema,
  context: ExecutorContext
): Configuration {
  const singleSpaConfig = require('../plugins/webpack.config.js')(
    {},
    { options, configuration: context.configurationName }
  );
  const projectConfig = options.webpackConfig
    ? require(options.webpackConfig)
    : {};

  return merge(singleSpaConfig, projectConfig);
}
