/* eslint-disable @typescript-eslint/ban-types,no-console */
import { generateTargetEnvHandler } from './generate-target-env-handler';
import type { GullyCommandDef } from '../../types/gully-types';
import { TargetEnvArgs, targetEnvArgs } from '../common-args/target-env-args';

export interface GenerateTargetEnvCliArgs extends TargetEnvArgs {
  upload: boolean;
  jsonOutput: string;
}

export const generateTargetEnvCmd: GullyCommandDef<
  {},
  GenerateTargetEnvCliArgs
> = {
  command: 'generate-target-env',
  describe: 'Generate the target-env.json file',
  builder: {
    ...targetEnvArgs,
    upload: {
      type: 'boolean',
      description:
        'Flag to indicate if component zips should be uploaded to s3',
    },
    jsonOutput: {
      type: 'string',
      description:
        'path to output file, like ./target-env.json.  If not set the output is written to stdout in json format',
    },
  },
  handler: generateTargetEnvHandler,
};
