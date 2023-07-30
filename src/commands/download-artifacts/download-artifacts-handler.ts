
import {join, resolve} from 'node:path';
import {existsSync, mkdirSync} from 'node:fs';
import pMap from 'p-map';
import {writeOutputFile} from '../../util/write-output-file';
import {readTargetEnvJson} from '../../util/parse-json';
import type {
	ComponentData,
	FunctionGroup,
	TargetEnvFile,
} from '../../types/wadi-types';
import {writeS3ObjectToFile} from '../../aws';
import type {DownloadArtifactsCliArgs} from './download-artifacts-command';

// ////////////////////////////////////////////////////////////////////
// Types
// ////////////////////////////////////////////////////////////////////

export type Params = {
	components: TargetComponentData[];
	targetEnvJsonPath: string;
};

export type TargetComponentData = {
	component: string;
	version: string;
	localZipFile: string;
	functionGroup?: FunctionGroup;
};

// ////////////////////////////////////////////////////////////////////
// Functions
// ////////////////////////////////////////////////////////////////////

function downloadComponent(destDir: string, Bucket: string) {
	if (!existsSync(destDir)) {
		mkdirSync(destDir, {recursive: true});
	}

	/**
   * Download the zip for the given component and update the component map with
   * the download location
   */
	return async ([component, componentData]: [
		string,
		ComponentData]): Promise<number> => {
		const Key = componentData.build_artifact_path;
		if (!Key) {
			throw new Error(`build_artifact_path not found for ${component}`);
		}

		// We mainly download zip files, but maybe in the future we have tgz, 7zip or something
		const extension = Key.slice(Math.max(0, Key.lastIndexOf('.') + 1));
		const localZipFile = resolve(join(destDir, `${component}.${extension}`));
		const byteCount = await writeS3ObjectToFile({Bucket, Key}, localZipFile);

		// Save the download path
		componentData.localZipFile = localZipFile;

		return byteCount;
	};
}

async function downloadArtifacts(
	{components, s3_assets_bucket}: TargetEnvFile,
	args: DownloadArtifactsCliArgs,
): Promise<void> {
	const {concurrency, outputFolder, buildTypes} = args;
	const buildTypeList: string[] = buildTypes?.split(',');

	const start = Date.now();
	const results = await pMap(
		Object.entries(components).filter(
			([, comp]) =>
				!buildTypeList
        || (comp.build_type && buildTypeList.includes(comp.build_type)),
		),
		downloadComponent(outputFolder, s3_assets_bucket),
		{concurrency},
	);
	const finish = Date.now();
	let fileCount = 0;
	let byteCount = 0;
	for (const fileSize of results) {
		byteCount += fileSize;
		fileCount += 1;
	}

	const duration = finish - start;
	const rate = byteCount / duration;
	console.log(
		`Downloaded ${byteCount} bytes, in ${fileCount} files, with ${concurrency} parallel downloads. It took ${(
			duration / 1000
		).toFixed(3)} seconds  That is ${rate.toFixed(0)} KB/s`,
	);
}

export async function downloadArtifactsHandler(args: DownloadArtifactsCliArgs) {
	const targetEnv = await readTargetEnvJson(args.targetEnvJsonPath);

	await downloadArtifacts(targetEnv, args);

	await writeOutputFile(args.targetEnvJsonPath, targetEnv);
}
