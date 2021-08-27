/* eslint-disable @typescript-eslint/no-var-requires */
import { resolve } from 'path';
import { BuildExecutorSchema } from '../executors/build/schema';

export interface WebpackBuildSchema extends BuildExecutorSchema {
  project: string;
}

export function normalizeWebBuildOptions(
  root: string,
  options: BuildExecutorSchema
): WebpackBuildSchema {
  return {
    ...options,
    filename: resolve(root, options.filename),
    outputPath: resolve(options.outputPath),
    webpackConfig: options.webpackConfig
      ? resolve(root, options.webpackConfig)
      : null,
  };
}
