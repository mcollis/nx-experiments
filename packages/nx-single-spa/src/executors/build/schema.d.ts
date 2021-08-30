export interface BuildExecutorSchema {
  project: string;
  organization: string;
  webpackConfig: string;
  outputPath: string;
  filename: string;
  standalone: boolean;
} // eslint-disable-line
