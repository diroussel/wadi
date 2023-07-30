import type {Buffer} from 'node:buffer';
import type {Readable} from 'node:stream';
import {uploadComponentZipFiles} from '../../util/uploadComponentZipFiles';
import {writeOutputFile} from '../../util/writeOutputFile';
import {processTargetEnvCliArgs} from '../common-args/target-env-args';
import {buildTargetEnv} from '../../util/buildTargetEnv';
import type {GenerateTargetEnvCliArgs} from './generate-target-env-command';

// ////////////////////////////////////////////////////////////////////
// Types
// ////////////////////////////////////////////////////////////////////

export type Upload = {
	Body: Readable | ReadableStream | Blob | string | Uint8Array | Buffer;
	Bucket: string;
	Key: string;
	ACL?: string;
};

// ////////////////////////////////////////////////////////////////////
// Functions
// ////////////////////////////////////////////////////////////////////

export async function generateTargetEnvHandler(args: GenerateTargetEnvCliArgs) {
	const parameters = await processTargetEnvCliArgs(args);
	if (args.upload) {
		await uploadComponentZipFiles(parameters);
	}

	const targetEnv = buildTargetEnv(parameters);
	if (args.jsonOutput) {
		await writeOutputFile(args.jsonOutput, targetEnv);
	} else {
		console.log(JSON.stringify(targetEnv, null, 2));
	}
}
