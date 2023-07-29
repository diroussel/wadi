/* eslint-disable no-param-reassign */
import type { Options } from 'yargs';
import { buildComponentMap } from '../../util/buildComponentMap';
import { readJsonFile } from '../../util/parseJson';
import { readCurrentGitBranch } from '../../util/readCurrentGitBranch';
import { findGitRepoRoot } from '../../util/findGitRepoRoot';
import type { ComponentData, PkgJson } from '../../types/gully-types';

//
// Common args definition and types, that can be used in and command that wants to generate target-env.json
//

export interface TargetEnvArgs {
  componentNames: string | undefined;
  projRootDir: string;
  versionRoot: string | undefined;
  buildVersion: string | null;
  buildNum: string;
  branch: string;
  s3AssetsBucket: string;
  s3AssetsPathRoot: string;
  distPrefix: string;
  addLocalZipPath: boolean;
}

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
        'List of names of components to include in target-env.json.  ' +
        'Usually this is not specified, and a list of components is read from the `distDir` argument.',
    },
    buildVersion: {
      type: 'string',
      description: 'Full current version of the build',
    },
    branch: { type: 'string', description: 'The current git branch' },
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
      default: process.env.CI_PIPELINE_IID || '0',
    },
    addLocalZipPath: {
      type: 'boolean',
      description:
        'When set, the path the zip of each component will be added as "localZipFile" for each component',
      default: false,
    },
  }
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
}: TargetEnvArgs): Promise<TargetEnvParams> {
  if (!projRootDir) {
    projRootDir = await findGitRepoRoot();
  }

  let componentMap;
  if (!componentNames || componentNames.length === 0) {
    // no components passed in cli args, so read them from disk
    componentMap = await buildComponentMap(addLocalZipPath, projRootDir);
  } else {
    // comma separate list passed in as an arg, split and convert to map
    // eslint-disable-next-line no-restricted-properties
    componentMap = Object.fromEntries(
      componentNames.split(',').map((comp) => [comp, {}])
    );
  }

  if (!versionRoot) {
    const packageDotJson = await readJsonFile<PkgJson>(
      `${projRootDir}/package.json`
    );
    versionRoot = packageDotJson.version;
  }

  if (!branch) {
    const ciCommitRef = process.env.CI_COMMIT_REF_NAME;
    if (ciCommitRef) {
      // we are in a ci/cd pipeline so use the current branch according to CI
      branch = ciCommitRef;
    } else {
      // no branch specified, so ask git what branch we are on
      branch = await readCurrentGitBranch();
    }
  }

  let componentVersion;
  if (buildVersion === 'latest') {
    componentVersion = 'latest';
  } else {
    componentVersion = `${versionRoot}.${buildNum}`;
  }

  return {
    componentMap,
    versionRoot,
    componentVersion,
    branch,
    s3AssetsBucket,
    s3AssetsPathRoot,
    distPrefix
  };
}
