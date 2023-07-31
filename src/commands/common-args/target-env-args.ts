import process from 'node:process';
import type {Options} from 'yargs';
import {buildComponentMap} from '../../util/build-component-map';
import {readJsonFile} from '../../util/parse-json';
import {readCurrentGitBranch} from '../../util/read-current-git-branch';
import {findGitRepoRoot} from '../../util/find-git-repo-root';
import type {ComponentData, PkgJson} from '../../types/wadi-types';

//
// Common args definition and types, that can be used in and command that wants to generate target-env.json
//

export type TargetEnvArgs = {
	componentNames: string | undefined;
	projRootDir: string;
	versionRoot: string | undefined;
	buildVersion: string | undefined;
	buildNum: string;
	branch: string;
	s3AssetsBucket: string;
	s3AssetsPathRoot: string;
	distPrefix: string;appPrefix: string;
	addLocalZipPath: boolean;
};

function addGroup(group: string, args: Record<string, Options>) {
	for (const option of Object.values(args)) {
		option.group = group;
	}

	return args;
}

export const targetEnvArgs: Record<keyof TargetEnvArgs, Options> = addGroup(
	'target-env.json options:',
	{
		versionRoot: {
			type: 'string',
			description: 'The project version to go in the target-env.json',
		},
		projRootDir: {
			type: 'string',
			description: 'path to the root of the repo',
		},
		componentNames: {
			type: 'string',
			description:
        'List of names of components to include in target-env.json.  '
        + 'Usually this is not specified, and a list of components is read from the `distDir` argument.',
		},
		buildVersion: {
			type: 'string',
			description: 'Full current version of the build',
		},
		branch: {type: 'string', description: 'The current git branch'},
		s3AssetsBucket: {
			type: 'string',
			description: 'The S3 bucket the component artifacts are stored in',
			alias: 'bucket',
			default: process.env.S3_ARTIFACTS_BUCKET_NAME,
		},
		s3AssetsPathRoot: {
			type: 'string',
			description: 'S3 bucket to upload to, when uploading zips',
			alias: 's3path',
			default: process.env.S3_ARTIFACTS_PATH_ROOT,
		},
		distPrefix: {
			type: 'string',
			description: 'Prefix added to the front of the zip file name. e.g. "Org.App1."',
			default: '',
		},
		buildNum: {
			type: 'string',
			description: 'S3 path prefix used when uploading zips',
			default: process.env.CI_PIPELINE_IID ?? '0',
		},
		addLocalZipPath: {
			type: 'boolean',
			description:
        'When set, the path the zip of each component will be added as "localZipFile" for each component',
			default: false,
		},
	},
);

export type TargetEnvParams = {
	componentMap: Record<string, ComponentData>;
	componentVersion: string;
	versionRoot: string;
	branch: string;
	s3AssetsBucket: string;
	s3AssetsPathRoot: string;
	distPrefix: string;
};

export async function processTargetEnvCliArgs({
	componentNames,
	projRootDir,
	versionRoot,
	buildVersion,
	buildNum,
	branch,
	s3AssetsBucket,
	s3AssetsPathRoot,
	distPrefix,
	addLocalZipPath,
	appPrefix,
}: TargetEnvArgs): Promise<TargetEnvParams> {
	if (!projRootDir) {
		projRootDir = await findGitRepoRoot();
	}

	let componentMap;
	if (!componentNames || componentNames.length === 0) {
		// No components passed in cli args, so read them from disk
		componentMap = await buildComponentMap(addLocalZipPath, projRootDir, distPrefix, appPrefix);
	} else {
		// Comma separate list passed in as an arg, split and convert to map

		componentMap = Object.fromEntries(
			componentNames.split(',').map(comp => [comp, {}]),
		);
	}

	if (!versionRoot) {
		const packageDotJson = await readJsonFile<PkgJson>(
			`${projRootDir}/package.json`,
		);
		versionRoot = packageDotJson.version;
	}

	if (!branch) {
		const ciCommitRef = process.env.CI_COMMIT_REF_NAME;
		// See if we are in a ci/cd pipeline so use the current branch according to CI
		// if no branch is specified, ask git what branch we are on
		branch = ciCommitRef ?? await readCurrentGitBranch();
	}

	const componentVersion = buildVersion === 'latest' ? 'latest' : `${versionRoot}.${buildNum}`;

	return {
		componentMap,
		versionRoot,
		componentVersion,
		branch,
		s3AssetsBucket,
		s3AssetsPathRoot,
		distPrefix,
	};
}
