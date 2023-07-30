
import {async as StreamZip} from 'node-stream-zip';
import pMap from 'p-map';
import {writeOutputFile} from '../../util/write-output-file';
import {parseJson, readTargetEnvJson} from '../../util/parse-json';
import type {FunctionGroup, LambdaMappings} from '../../types/gully-types';
import type {GenerateOpenapi3VarMapCliArgs} from './generate-openapi3-varmap-command';

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

async function readTargetEnv({
	targetEnvJsonPath,
}: GenerateOpenapi3VarMapCliArgs): Promise<Params> {
	const jsonObject = await readTargetEnvJson(targetEnvJsonPath);

	const components: TargetComponentData[] = Object.entries(
		jsonObject.components,
	).flatMap(([component, componentData]) => {
		const {localZipFile, build_type, version} = componentData;

		if (build_type !== 'apigateway') {
			return [];
		}

		if (!localZipFile) {
			throw new Error(
				`No localZipFile specified for component '${component}' in ${targetEnvJsonPath}. componentData => ${JSON.stringify(
					componentData,
				)}`,
			);
		}

		if (!version) {
			throw new Error(`No version specified for component '${component}'`);
		}

		return [{component, localZipFile, version}];
	});

	return {components, targetEnvJsonPath};
}

/**
 * Open the component zip, and read the lambda-mappings.json file so we can know the name of all the functions
 * defined inside. We want to put these function names into terraform vars, to pass to the openapi3 module
 *
 * @param component the name of the component
 * @param version the version of the component
 * @param localZipFile the artifact zip of the component
 */
async function enrichComponentData({
	component,
	version,
	localZipFile,
}: TargetComponentData): Promise<TargetComponentData> {
	// Open zip file, and read the file
	const zip = new StreamZip({file: localZipFile});
	const lambdaMappings = await zip.entryData('lambda-mappings.json');
	await zip.close();

	// Trim build number off version, to avoid terraform updates on minor builds
	version = version.slice(0, Math.max(0, version.lastIndexOf('.')));

	// Parse the json and extract the data we need
	const functionGroup
    = parseJson<LambdaMappings>(lambdaMappings).lambda_function_group;

	return {component, version, functionGroup, localZipFile};
}

async function buildEnvVarMap(
	parameters: Params,
): Promise<Record<string, TargetComponentData>> {
	const {components} = parameters;

	const componentFuncs = await pMap(components, enrichComponentData, {
		concurrency: 4,
	});

	// Format as string to string map, as terraform handles that better
	return Object.fromEntries(
		componentFuncs.map(data => [data.component, data]),
	);
}

export async function generateTargetEnvHandler(
	args: GenerateOpenapi3VarMapCliArgs,
) {
	const parameters = await readTargetEnv(args);

	const varMap = await buildEnvVarMap(parameters);

	if (args.jsonOutput) {
		await writeOutputFile(args.jsonOutput, {apigateway_openapi3_map: varMap});
	} else {
		console.log(`apigateway_openapi3_map = ${JSON.stringify(varMap)}`);
	}
}
