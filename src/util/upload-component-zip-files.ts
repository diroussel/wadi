import {readFile} from 'node:fs/promises';
import pMap from 'p-map';
import type {ComponentData} from '../types/wadi-types';
import type {TargetEnvParams} from '../commands/common-args/target-env-args';
import {uploadObjectToS3} from '../aws/put-data-s3';

export async function uploadComponentZipFiles(
	parameters: TargetEnvParams,
): Promise<TargetEnvParams> {
	const {componentMap} = parameters;

	async function uploadComponent([component, componentData]: [
		string,
		ComponentData]): Promise<void> {
		const {localZipFile} = componentData;
		if (!localZipFile) {
			throw new Error(`no local zip for component ${component}`);
		}

		const {componentVersion, branch, s3AssetsPathRoot, s3AssetsBucket}
      = parameters;
		const filename = localZipFile.slice(Math.max(0, localZipFile.lastIndexOf('/') + 1));
		const remotePath = `${s3AssetsPathRoot}${component}/${branch}_${componentVersion}/buildartifact/${filename}`;
		const data = await readFile(localZipFile);

		await uploadObjectToS3(
			{
				Bucket: s3AssetsBucket,
				Key: remotePath,
				Body: data,
				ACL: 'bucket-owner-full-control',
			},
			console,
		);

		componentData.zip_path = remotePath;
	}

	// Do the upload in parallel, but not all at once
	await pMap(Object.entries(componentMap), uploadComponent, {concurrency: 4});

	return parameters;
}
