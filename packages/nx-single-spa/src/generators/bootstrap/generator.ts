import {
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getProjects,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  toJS,
  Tree,
  updateProjectConfiguration,
  writeJson,
} from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import * as path from 'path';
import * as R from 'ramda';
import { BootstrapGeneratorSchema } from './schema';
import singleSpaInitGenerator from '../init/generator';

interface NormalizedSchema extends BootstrapGeneratorSchema {
  root: string;
  sourceRoot: string;
  projectType: string;
}

async function normalizeOptions(
  tree: Tree,
  options: BootstrapGeneratorSchema
): Promise<NormalizedSchema> {
  const { npmScope } = getWorkspaceLayout(tree);
  const project = getProjects(tree).get(options.projectName);
  const { root, sourceRoot, projectType } = project;

  const directory = await getDirectory(tree, options);

  return {
    ...options,
    organization: names(options.organization || npmScope).fileName,
    root,
    sourceRoot,
    projectType,
    directory,
  };
}

async function getDirectory(host: Tree, options: BootstrapGeneratorSchema) {
  const workspace = getProjects(host);
  let baseDir: string;
  if (options.directory) {
    baseDir = options.directory;
  } else {
    baseDir =
      workspace.get(options.projectName).projectType === 'application'
        ? 'app'
        : 'lib';
  }
  return baseDir;
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    offsetFromRoot: offsetFromRoot(options.sourceRoot),
    template: '',
    entry: joinPathFragments(
      `src/${options.organization}-${options.projectName}`
    ),
    appRoot: options.root,
  };
  generateFiles(
    tree,
    path.join(__dirname, '../../utils/files'),
    options.root,
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

function updateProjConfig(tree: Tree, options: NormalizedSchema) {
  const project = R.over(R.lensProp('targets'), (targets) => ({
    ...targets,
    build: {
      executor: '@nrwl/workspace:run-commands',
      options: {
        command: 'webpack',
        color: true,
        config: joinPathFragments(
          options.root,
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
          options.root,
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
  }))(getProjects(tree).get(options.projectName));
  updateProjectConfiguration(tree, options.projectName, project);
}

export default async function (tree: Tree, options: BootstrapGeneratorSchema) {
  const normalizedOptions = await normalizeOptions(tree, options);
  const tasks: GeneratorCallback[] = [];

  const initTask = await singleSpaInitGenerator(tree, options);
  tasks.push(initTask);

  updateProjConfig(tree, normalizedOptions);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}
