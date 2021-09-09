import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration, readJson } from '@nrwl/devkit';
import { createApp } from '@nrwl/react/src/utils/testing-generators';

import generator from './generator';
import { BootstrapGeneratorSchema } from './schema';

describe('bootstrap generator', () => {
  let appTree: Tree;
  const options: BootstrapGeneratorSchema = {
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
    expect(appTree.exists(`apps/my-app/src/root.component.tsx`)).toBeTruthy();
  });
  it('should generate javascript files', async () => {
    await generator(appTree, { ...options, js: true });
    expect(appTree.exists('tsconfig.json')).toBeTruthy();
    expect(appTree.exists('apps/my-app/webpack.config.js')).toBeTruthy();
    expect(
      appTree.exists(
        `apps/my-app/src/${options.organization}-${options.project}.js`
      )
    ).toBeTruthy();
    expect(appTree.exists(`apps/my-app/src/root.component.js`)).toBeTruthy();
  });
  it('should add nx-single-spa dependencies', async () => {
    await generator(appTree, options);
    const packageJson = readJson(appTree, 'package.json');
    expect(packageJson.dependencies['single-spa-react']).toBeDefined();
    expect(packageJson.devDependencies['url-loader']).toBeDefined();
    expect(packageJson.devDependencies['webpack-merge']).toBeDefined();
    expect(
      packageJson.devDependencies['webpack-config-single-spa-react-ts']
    ).toBeDefined();
  });
});
