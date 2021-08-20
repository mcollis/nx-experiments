import {
  Tree,
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { join } from 'path';
import { normalizeOptions as reactNormalizeOptions } from '@nrwl/react/src/generators/application/lib/normalize-options';
import reactApplicationGenerator from '@nrwl/react/src/generators/application/application';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';

import { MyPluginGeneratorSchema } from './schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires

interface NormalizedSchema extends MyPluginGeneratorSchema {
  appName: string;
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function updateDependencies(host: Tree) {
  return addDependenciesToPackageJson(
    host,
    {
      'single-spa-react': 'latest',
    },
    {
      'systemjs-webpack-interop': 'latest',
    }
  );
}

function normalizeOptions(
  tree: Tree,
  options: MyPluginGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];
  const appName = options.pascalCaseFiles ? 'App' : 'app';

  return {
    ...options,
    appName,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function createApplicationFiles(tree: Tree, options: NormalizedSchema) {
  const templateVariables = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    tmpl: '',
  };

  console.log(templateVariables);

  generateFiles(
    tree,
    join(__dirname, './files'),
    options.projectRoot,
    templateVariables
  );
}

export default async function (tree: Tree, options: MyPluginGeneratorSchema) {
  const reactApplicationTask = await reactApplicationGenerator(
    tree,
    reactNormalizeOptions(tree, options)
  );

  const normalizedOptions = normalizeOptions(tree, options);

  const installTask = updateDependencies(tree);
  createApplicationFiles(tree, normalizedOptions);

  await formatFiles(tree);

  const projConfig = readProjectConfiguration(
    tree,
    normalizedOptions.projectName
  );
  projConfig.targets.build.options.webpackConfig =
    '@my-plugin/my-plugin/plugins/webpack';
  projConfig.targets.build.options.orgName = options.orgName;
  projConfig.targets.build.options.projectName = normalizedOptions.projectName;

  projConfig.targets.serve.options.webpackConfig =
    '@my-plugin/my-plugin/plugins/webpack';
  projConfig.targets.serve.options.orgName = options.orgName;
  projConfig.targets.serve.options.projectName = normalizedOptions.projectName;

  updateProjectConfiguration(tree, normalizedOptions.projectName, projConfig);

  return runTasksInSerial(reactApplicationTask, installTask);
}
