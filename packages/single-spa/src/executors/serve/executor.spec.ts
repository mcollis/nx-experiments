import { ServeExecutorSchema } from './schema';
import executor from './executor';
import { ProjectType } from '@nrwl/devkit';

jest.mock('@nrwl/devkit', () => {
  const actual = jest.requireActual('@nrwl/devkit');
  return {
    ...actual,
    readTargetOptions: jest.fn(
      ({ project, target }, { workspace }) =>
        workspace.projects[project].targets[target].options
    ),
  };
});

const options: ServeExecutorSchema = {
  buildTarget: 'my-project:build',
};

const context = {
  root: 'packages/single-spa/src/executors/build',
  cwd: '/root',
  workspace: {
    version: 2,
    projects: {
      'my-project': {
        root: 'apps/my-project',
        sourceRoot: 'apps/my-project/src',
        projectType: 'application' as ProjectType,
        targets: {
          build: {
            executor: '@my-plugin/single-spa:build',
            options: {
              project: 'my-project',
              organization: 'my-org',
              outputPath: 'dist/apps/my-project',
              filename: 'mocks/my-org-my-project',
              webpackConfig: 'mocks/webpack.config.js',
            },
          },
        },
      },
    },
  },
  isVerbose: false,
  projectName: 'my-project',
  targetName: 'serve',
};

describe('Serve Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
