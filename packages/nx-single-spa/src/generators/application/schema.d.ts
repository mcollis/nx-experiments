import { InitGeneratorSchema } from '../init/schema';
export interface ApplicationGeneratorSchema extends InitGeneratorSchema {
  name: string;
  organization?: string;
  outputPath?: string;
  js?: boolean;
  tags?: string;
  directory?: string;
}
