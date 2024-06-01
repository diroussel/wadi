import type { Readable } from 'node:stream';
import { buildTargetEnv } from '../../util/build-target-env';
import { uploadComponentZipFiles } from '../../util/upload-component-zip-files';
import { writeOutputFile } from '../../util/write-output-file';
import { processTargetEnvCliArgs } from '../common-args/target-env-args';
import type { GenerateTargetEnvCliArgs } from './generate-target-env-command';

// ////////////////////////////////////////////////////////////////////
// Types
// ////////////////////////////////////////////////////////////////////

export type Upload = {
  Body: Readable | ReadableStream | Blob | string | Uint8Array;
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
