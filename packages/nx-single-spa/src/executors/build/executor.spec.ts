import { BuildExecutorSchema } from './schema';
import executor from './executor';

const options: BuildExecutorSchema = {
  project: 'my-project',
  organization: 'my-org',
  outputPath: 'dist/apps/my-project',
  filename: 'mocks/my-org-my-project',
  webpackConfig: 'mocks/webpack.config.js',
};

const context = {
  root: 'packages/nx-single-spa/src/executors/build',
  cwd: '/root',
  workspace: {
    version: 2,
    projects: {},
  },
  isVerbose: false,
  projectName: 'example',
  targetName: 'build',
};

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
