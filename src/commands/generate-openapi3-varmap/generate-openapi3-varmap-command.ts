/* eslint-disable @typescript-eslint/ban-types */
import type {WadiCommandDef} from '../../types/wadi-types';
import {generateTargetEnvHandler} from './generate-openapi3-varmap-handler';

export type GenerateOpenapi3VarMapCliArgs = {
	targetEnvJsonPath: string;
	jsonOutput?: string;
};

export const generateOpenapi3VarmapCommand: WadiCommandDef<
{},
GenerateOpenapi3VarMapCliArgs
> = {
	command: 'generate-openapi3-varmap',
	describe:
    'Generate terraform variables file for inputs to the lambda-openapi3 module',
	builder: {
		targetEnvJsonPath: {
			type: 'string',
			description: 'path to target-env.json',
			default: 'target-env.json',
		},
		jsonOutput: {
			type: 'string',
			description:
        'path to output file, like something.tfvars.json.  If not set the output is written to stdout in tfvars format',
		},
	},
	handler: generateTargetEnvHandler,
};
