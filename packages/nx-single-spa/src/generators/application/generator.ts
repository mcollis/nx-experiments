import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  toJS,
  Tree,
  writeJson,
} from '@nrwl/devkit';
import * as path from 'path';
import { ApplicationGeneratorSchema } from './schema';
import singleSpaInitGenerator from '../init/generator';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';

interface NormalizedSchema extends ApplicationGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: ApplicationGeneratorSchema
): NormalizedSchema {
  const { npmScope } = getWorkspaceLayout(tree);
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    organization: names(options.organization || npmScope).fileName,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
    entry: joinPathFragments(
      `src/${options.organization}-${options.projectName}`
    ),
    appRoot: options.projectRoot,
  };
  generateFiles(
    tree,
    path.join(__dirname, './files'),
    options.projectRoot,
    templateOptions
  );
  generateFiles(
    tree,
    path.join(__dirname, '../../utils/files'),
    options.projectRoot,
    templateOptions
  );
  writeJson(tree, '/tsconfig.json', {
    extends: './tsconfig.base.json',
    files: [],
    include: [],
    references: [],
  });
  if (options.js) {
    toJS(tree);
  }
}

function updateDependencies(tree: Tree) {
  return addDependenciesToPackageJson(
    tree,
    {
      'single-spa-react': 'latest',
    },
    {
      '@babel/preset-env': 'latest',
      '@babel/preset-react': 'latest',
      '@babel/preset-typescript': 'latest',
      '@babel/plugin-transform-runtime': 'latest',
      'ts-config-single-spa': 'latest',
    }
  );
}

export default async function (
  tree: Tree,
  options: ApplicationGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  const tasks: GeneratorCallback[] = [];

  const initTask = await singleSpaInitGenerator(tree, options);
  tasks.push(initTask);
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: 'webpack',
          color: true,
          config: joinPathFragments(
            normalizedOptions.projectRoot,
            `webpack.config.${options.js ? 'js' : 'ts'}`
          ),
        },
        configurations: {
          production: {
            mode: 'production',
          },
          analyze: {
            env: 'analyze',
          },
        },
      },
      serve: {
        executor: '@nrwl/workspace:run-commands',
        options: {
          command: 'webpack serve',
          color: true,
          config: joinPathFragments(
            normalizedOptions.projectRoot,
            `webpack.config.${options.js ? 'js' : 'ts'}`
          ),
        },
        configurations: {
          production: {
            mode: 'production',
          },
          standalone: {
            env: 'standalone',
          },
        },
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
  const depsTask = updateDependencies(tree);
  tasks.push(depsTask);

  return runTasksInSerial(...tasks);
}
