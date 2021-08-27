import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  getProjects,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  Tree,
  updateProjectConfiguration,
  writeJson,
  writeJsonFile,
} from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
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
}

function updateProjConfig(tree: Tree, options: NormalizedSchema) {
  const project = R.over(R.lensProp('targets'), (targets) => ({
    ...targets,
    build: {
      executor: '@mcollis/nx-single-spa:build',
      outputs: ['{options.outputPath}'],
      options: {
        // root: options.root,
        project: options.project,
        organization: options.organization,
        filename: joinPathFragments(
          options.root,
          `src/${options.organization}-${options.project}`
        ),
        outputPath: joinPathFragments('dist', options.root),
        webpackConfig: joinPathFragments(options.root, 'webpack.config.ts'),
      },
    },
    serve: {
      ...targets.serve,
      executor: '@mcollis/nx-single-spa:serve',
    },
  }))(getProjects(tree).get(options.project));
  updateProjectConfiguration(tree, options.project, project);
}

export default async function (
  tree: Tree,
  options: ApplicationGeneratorSchema
) {
  const normalizedOptions = await normalizeOptions(tree, options);
  updateProjConfig(tree, normalizedOptions);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
  const depTask = await addDeps(tree);
  return runTasksInSerial(depTask);
}
