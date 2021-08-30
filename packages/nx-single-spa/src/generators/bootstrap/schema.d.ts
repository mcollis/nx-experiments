export interface BootstrapGeneratorSchema {
  project: string;
  organization?: string;
  outputPath?: string;
  js?: boolean;
  tags?: string;
  directory?: string;
}
