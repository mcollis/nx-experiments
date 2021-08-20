import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { MyPluginGeneratorSchema } from './schema';
import { Linter } from '@nrwl/linter';

describe('my-plugin generator', () => {
  let appTree: Tree;
  const options: MyPluginGeneratorSchema = {
    name: 'test',
    orgName: 'mcollis',
    style: 'css',
    skipFormat: false,
    unitTestRunner: 'none',
    babelJest: false,
    e2eTestRunner: 'none',
    linter: Linter.EsLint,
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });
});
