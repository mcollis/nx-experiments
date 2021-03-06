import { InitGeneratorSchema } from '../init/schema';

export interface BootstrapGeneratorSchema extends InitGeneratorSchema {
  projectName: string;
  organization?: string;
  outputPath?: string;
  js?: boolean;
  tags?: string;
  directory?: string;
}
