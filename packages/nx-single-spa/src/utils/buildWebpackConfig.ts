/* eslint-disable @typescript-eslint/no-var-requires */
import { Configuration } from 'webpack';
import { merge } from 'webpack-merge';
import { WebpackBuildSchema } from './normalize';

export default function buildWebpackConfig(
  options: WebpackBuildSchema
): Configuration {
  const singleSpaConfig = require('../plugins/webpack.config.js')(
    {},
    { options }
  );
  const projectConfig = options.webpackConfig
    ? require(options.webpackConfig)
    : {};

  return merge(singleSpaConfig, projectConfig);
}
