import {
  ExecutorContext,
  parseTargetString,
  readTargetOptions,
} from '@nrwl/devkit';
import { promisify } from 'util';
import * as webpack from 'webpack';
import * as WebpackDevServer from 'webpack-dev-server';
import { eachValueFrom } from 'rxjs-for-await';
import { map, tap } from 'rxjs/operators';
import {
  getEmittedFiles,
  runWebpackDevServer,
} from '@nrwl/workspace/src/utilities/run-webpack';
import buildWebpackConfig from '../../utils/buildWebpackConfig';
import { normalizeWebBuildOptions } from '../../utils/normalize';
import { ServeExecutorSchema } from './schema';

// function setupWebpackDevServer(webpackCompiler, devServerConfig, callback) {
//   const webpackServer = new WebpackDevServer(webpackCompiler, devServerConfig);
//   return webpackServer.listen(
//     devServerConfig.port ?? 8080,
//     devServerConfig.host ?? 'localhost',
//     callback
//   );
// }

// export const runWebpackDevServer = promisify(setupWebpackDevServer);

export default async function* runExecutor(
  options: ServeExecutorSchema,
  context: ExecutorContext
) {
  const target = parseTargetString(options.buildTarget);
  const buildOptions = readTargetOptions(target, context);
  const normalizedOptions = normalizeWebBuildOptions(
    context.root,
    buildOptions
  );
  const config = buildWebpackConfig(normalizedOptions);

  console.log('Executor ran for Serve', options);

  return yield* eachValueFrom(
    runWebpackDevServer(config, webpack, WebpackDevServer).pipe(
      tap(({ stats }) => {
        console.info(stats.toString(config.stats));
      }),
      map(({ baseUrl, stats }) => {
        return {
          baseUrl,
          emittedFiles: getEmittedFiles(stats),
          success: !stats.hasErrors(),
        };
      })
    )
  );
}
