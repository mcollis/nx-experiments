/* eslint-disable @typescript-eslint/no-var-requires */
import { Configuration } from 'webpack';

const getWebpackConfig = require('@nrwl/react/plugins/webpack');
const SystemJSPublicPathPlugin = require('systemjs-webpack-interop/SystemJSPublicPathWebpackPlugin');

const setWebpackConfig = (
  config: Configuration,
  { options, configuration }
) => {
  const reactConfig = getWebpackConfig(config);
  reactConfig.plugins.push(
    new SystemJSPublicPathPlugin({
      systemjsModuleName: `@${options.orgName}/${options.projectName}`,
      rootDirectoryLevel: options.outputPath,
    })
  );
  reactConfig.output.libraryTarget = 'system';
  console.log(reactConfig);
  return reactConfig;
};

module.exports = setWebpackConfig;
