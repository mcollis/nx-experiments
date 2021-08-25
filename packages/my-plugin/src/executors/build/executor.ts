import type { ExecutorContext } from '@nrwl/devkit';
import { promisify } from 'util';
import { merge } from 'webpack-merge';

import { BuildExecutorSchema } from './schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { webpack } = require('@nrwl/web/src/webpack/entry');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const singleSpaDefaults = require('webpack-config-single-spa-react');

const runWebpack = promisify(webpack);

export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext
) {
  const dir = `${context.root}/${
    context.workspace.projects[context.projectName].root
  }`;
  const defaultConfig = singleSpaDefaults({
    orgName: options.orgName,
    projectName: context.projectName,
    webpackConfigEnv: {},
    argv: {},
  });
  const config = merge(defaultConfig, {
    entry: `${dir}/src/${options.orgName}-${context.projectName}`,
    output: {
      path: `${defaultConfig.output.path}/${context.projectName}`,
    },
  });
  // console.log(JSON.stringify(config, null, 2));
  return runWebpack(config).then(() => ({ success: true }));
  return Promise.resolve({ success: true });
}
