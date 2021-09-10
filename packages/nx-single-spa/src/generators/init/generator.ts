import {
  addDependenciesToPackageJson,
  GeneratorCallback,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import { webInitGenerator } from '@nrwl/web';
import migrateWebpack from '@nrwl/web/src/generators/migrate-to-webpack-5/migrate-to-webpack-5';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { reactInitGenerator } from '@nrwl/react';
import { InitGeneratorSchema } from './schema';

function updateDependencies(tree: Tree) {
  updateJson(tree, 'package.json', (json) => {
    if (json.dependencies && json.dependencies['@mcollis/nx-single-spa']) {
      delete json.dependencies['@mcollis/nx-single-spa'];
    }
    return json;
  });

  return addDependenciesToPackageJson(
    tree,
    {
      'single-spa-react': 'latest',
    },
    {
      '@mcollis/nx-single-spa': 'latest',
      'url-loader': '^3.0.0',
      'webpack-cli': 'latest',
      'webpack-merge': 'latest',
      'webpack-config-single-spa-react-ts': 'latest',
    }
  );
}

export default async function (tree: Tree, options: InitGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];

  const webTask = await webInitGenerator(tree, options);
  tasks.push(webTask);
  const reactTask = await reactInitGenerator(tree, options);
  tasks.push(reactTask);
  const webpackTask = await migrateWebpack(tree, {});
  tasks.push(webpackTask);
  const installTask = updateDependencies(tree);
  tasks.push(installTask);

  return runTasksInSerial(...tasks);
}
