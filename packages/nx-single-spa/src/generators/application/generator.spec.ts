import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration, names, readJson } from '@nrwl/devkit';

import generator from './generator';
import { ApplicationGeneratorSchema } from './schema';

describe('application generator', () => {
  let appTree: Tree;
  const options: ApplicationGeneratorSchema = {
    name: 'my-app',
    organization: 'my-org',
  };
  const projectName = names(options.name).fileName;

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
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
    expect(appTree.exists('apps/my-app/.babelrc')).toBeTruthy();
    expect(appTree.exists('apps/my-app/tsconfig.json')).toBeTruthy();
    expect(
      appTree.exists(
        `apps/my-app/src/${options.organization}-${projectName}.tsx`
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
        `apps/my-app/src/${options.organization}-${projectName}.js`
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
