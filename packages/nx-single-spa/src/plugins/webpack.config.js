/* eslint-disable @typescript-eslint/no-var-requires */
const R = require('ramda');
const { join } = require('path');
const { merge } = require('webpack-merge');
const singleSpaDefaults = require('webpack-config-single-spa-react-ts');

const updateImageTest = R.evolve({
  test: R.always(/\.(bmp|png|jpg|jpeg|gif|webp)$/i),
});
const removeUseOptions = R.evolve({
  use: R.map(R.omit(['options'])),
});
const fixReactConfig = R.over(
  R.lensPath(['module', 'rules']),
  R.compose(
    R.over(R.lensIndex(1), removeUseOptions),
    R.over(R.lensIndex(2), updateImageTest)
  )
);

module.exports = ({
  orgName,
  projectName,
  entry,
  appRoot,
  webpackConfigEnv,
  argv,
}) => {
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName,
    webpackConfigEnv,
    argv,
  });

  const modifiedConfig = fixReactConfig(defaultConfig);

  return merge(modifiedConfig, {
    entry,
    output: {
      path: join(defaultConfig.output.path, appRoot),
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
