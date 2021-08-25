/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-react-ts');
const { join } = require('path');

module.exports = (webpackConfigEnv, { options, ...argv }) => {
  const defaultConfig = singleSpaDefaults({
    orgName: options.organization,
    projectName: options.project,
    webpackConfigEnv,
    argv,
  });

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    entry: options.filename,
    output: {
      path: join(defaultConfig.output.path, options.project),
    },
  });
};
