/* eslint-disable @typescript-eslint/ban-types */
import type {WadiCommandDef} from '../../types/wadi-types';
import {type TargetEnvArgs, targetEnvArgs} from '../common-args/target-env-args';
import {generateTargetEnvHandler} from './generate-target-env-handler';

export type GenerateTargetEnvCliArgs = {
	upload: boolean;
	jsonOutput: string;
} & TargetEnvArgs;

export const generateTargetEnvCmd: WadiCommandDef<
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
