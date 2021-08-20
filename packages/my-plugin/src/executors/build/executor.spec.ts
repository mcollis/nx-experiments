import type { ExecutorContext } from '@nrwl/devkit';
import { BuildExecutorSchema } from './schema';
import executor from './executor';

const options: BuildExecutorSchema = { orgName: 'my-org' };

describe('Build Executor', () => {
  let context: ExecutorContext;
  beforeEach(async () => {
    context = {
      root: '/root',
      cwd: '/root',
      workspace: {
        version: 2,
        projects: {
          example: {
            root: 'apps/example',
            projectType: 'library',
            sourceRoot: 'apps/example/src',
            targets: {
              build: {
                executor: '@my-plugin/my-plugin:build',
              },
            },
          },
        },
      },
      isVerbose: false,
      projectName: 'example',
      targetName: 'build',
    };
  });
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
