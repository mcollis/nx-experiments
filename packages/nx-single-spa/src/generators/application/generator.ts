import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
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
import migrateWebpack from '@nrwl/web/src/generators/migrate-to-webpack-5/migrate-to-webpack-5';
import * as path from 'path';
import * as R from 'ramda';
import { ApplicationGeneratorSchema } from './schema';

interface NormalizedSchema extends ApplicationGeneratorSchema {
  root: string;
  sourceRoot: string;
  projectType: string;
}

async function normalizeOptions(
  tree: Tree,
  options: ApplicationGeneratorSchema
): Promise<NormalizedSchema> {
  const { npmScope } = getWorkspaceLayout(tree);
  const project = getProjects(tree).get(options.project);
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

async function getDirectory(host: Tree, options: ApplicationGeneratorSchema) {
  const workspace = getProjects(host);
  let baseDir: string;
  if (options.directory) {
    baseDir = options.directory;
  } else {
    baseDir =
      workspace.get(options.project).projectType === 'application'
        ? 'app'
        : 'lib';
  }
  return baseDir;
}

async function addDeps(tree: Tree) {
  const installTask = await addDependenciesToPackageJson(
    tree,
    { 'single-spa-react': 'latest' },
    {
      'url-loader': '^3.0.0',
      'webpack-cli': 'latest',
      'webpack-merge': 'latest',
      'webpack-config-single-spa-react-ts': 'latest',
    }
  );

  return runTasksInSerial(installTask);
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    offsetFromRoot: offsetFromRoot(options.sourceRoot),
    template: '',
    project: options.project,
    organization: options.organization,
    entry: joinPathFragments(`src/${options.organization}-${options.project}`),
    appRoot: options.root,
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
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
  }))(getProjects(tree).get(options.project));
  updateProjectConfiguration(tree, options.project, project);
}

export default async function (
  tree: Tree,
  options: ApplicationGeneratorSchema
) {
  const migrateWebpackTasks = await migrateWebpack(tree, {});
  const normalizedOptions = await normalizeOptions(tree, options);
  updateProjConfig(tree, normalizedOptions);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
  const depTask = await addDeps(tree);
  return runTasksInSerial(migrateWebpackTasks, depTask);
}
