/* eslint-disable no-console,no-param-reassign */
import type { Readable } from 'stream';

import { uploadComponentZipFiles } from '../../util/uploadComponentZipFiles';
import type { GenerateTargetEnvCliArgs } from './generate-target-env-command';
import { writeOutputFile } from '../../util/writeOutputFile';
import { processTargetEnvCliArgs } from '../common-args/target-env-args';
import { buildTargetEnv } from '../../util/buildTargetEnv';

// ////////////////////////////////////////////////////////////////////
// Types
// ////////////////////////////////////////////////////////////////////

export interface Upload {
  Body: Readable | ReadableStream | Blob | string | Uint8Array | Buffer;
  Bucket: string;
  Key: string;
  ACL?: string;
}

// ////////////////////////////////////////////////////////////////////
// Functions
// ////////////////////////////////////////////////////////////////////

export async function generateTargetEnvHandler(args: GenerateTargetEnvCliArgs) {
  const params = await processTargetEnvCliArgs(args);
  if (args.upload) {
    await uploadComponentZipFiles(params);
  }
  const targetEnv = buildTargetEnv(params);
  if (args.jsonOutput) {
    await writeOutputFile(args.jsonOutput, targetEnv);
  } else {
    console.log(JSON.stringify(targetEnv, null, 2));
  }
}
