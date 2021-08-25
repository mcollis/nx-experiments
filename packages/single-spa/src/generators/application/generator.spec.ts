import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration, readJson } from '@nrwl/devkit';
import { createApp } from '@nrwl/react/src/utils/testing-generators';

import generator from './generator';
import { ApplicationGeneratorSchema } from './schema';

describe('application generator', () => {
  let appTree: Tree;
  const options: ApplicationGeneratorSchema = {
    project: 'my-app',
    organization: 'my-org',
  };

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace();
    await createApp(appTree, 'my-app', false);
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'my-app');
    expect(config).toBeDefined();
  });
  it('should generate files', async () => {
    await generator(appTree, options);
    expect(appTree.exists('tsconfig.json')).toBeTruthy();
    expect(appTree.exists('apps/my-app/webpack.config.ts')).toBeTruthy();
    expect(
      appTree.exists(
        `apps/my-app/src/${options.organization}-${options.project}.tsx`
      )
    ).toBeTruthy();
  });
  it('should add single-spa dependencies', async () => {
    await generator(appTree, options);
    const packageJson = readJson(appTree, 'package.json');
    expect(packageJson.dependencies['single-spa-react']).toBeDefined();
    expect(packageJson.devDependencies['webpack-merge']).toBeDefined();
    expect(
      packageJson.devDependencies['webpack-config-single-spa-react-ts']
    ).toBeDefined();
  });
});
