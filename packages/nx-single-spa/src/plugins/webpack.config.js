/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-react-ts');

module.exports = (webpackConfigEnv, { options, ...argv }) => {
  const defaultConfig = singleSpaDefaults({
    orgName: options.organization,
    projectName: options.project,
    webpackConfigEnv,
    argv,
  });

  defaultConfig.module.rules[2].test = /\.(bmp|png|jpg|jpeg|gif|webp)$/i;

  // remove the options from css-loader
  delete defaultConfig.module.rules[1].use[1].options;

  return merge(defaultConfig, {
    entry: options.filename,
    output: {
      path: options.outputPath,
    },
    devServer: {
      onListening: function (devServer) {
        if (!devServer) {
          throw new Error('webpack-dev-server is not defined');
        }
        devServer.listeningApp = devServer.server;
      },
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          oneOf: [
            // If coming from JS/TS file, then transform into React component using SVGR.
            {
              issuer: /\.[jt]sx?$/,
              use: [
                {
                  loader: require.resolve('@svgr/webpack'),
                  options: {
                    svgo: false,
                    titleProp: true,
                    ref: true,
                  },
                },
                {
                  loader: require.resolve('url-loader'),
                  options: {
                    limit: 10000, // 10kB
                    name: '[name].[hash:7].[ext]',
                    esModule: false,
                  },
                },
              ],
            },
            // Fallback to plain URL loader.
            {
              use: [
                {
                  loader: require.resolve('url-loader'),
                  options: {
                    limit: 10000, // 10kB
                    name: '[name].[hash:7].[ext]',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  });
};
