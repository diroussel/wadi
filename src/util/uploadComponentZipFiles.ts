import { readFile } from 'fs/promises';
import pMap from 'p-map';

import type { ComponentData } from '../types/gully-types';
import type { TargetEnvParams } from '../commands/common-args/target-env-args';
import { uploadObjectToS3 } from '../aws/putDataS3';

export async function uploadComponentZipFiles(
  params: TargetEnvParams
): Promise<TargetEnvParams> {
  const { componentMap } = params;

  async function uploadComponent([component, componentData]: [
    string,
    ComponentData
  ]): Promise<void> {
    const { localZipFile } = componentData;
    if (!localZipFile) {
      throw new Error(`no local zip for component ${component}`);
    }
    const { componentVersion, branch, s3AssetsPathRoot, s3AssetsBucket } =
      params;
    const filename = localZipFile.substring(localZipFile.lastIndexOf('/') + 1);
    const remotePath = `${s3AssetsPathRoot}${component}/${branch}_${componentVersion}/buildartifact/${filename}`;
    const data = await readFile(localZipFile);

    await uploadObjectToS3(
      {
        Bucket: s3AssetsBucket,
        Key: remotePath,
        Body: data,
        ACL: 'bucket-owner-full-control',
      },
      console
    );

    // eslint-disable-next-line no-param-reassign
    componentData.zip_path = remotePath;
  }

  // Do the upload in parallel, but not all at once
  await pMap(Object.entries(componentMap), uploadComponent, { concurrency: 4 });

  return params;
}
