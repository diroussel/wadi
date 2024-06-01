import type { ComponentData } from '../../types/wadi-types';
import { buildTargetEnv } from '../../util/build-target-env';

describe('buildTargetEnv', () => {
  it('builds the target env', () => {
    const componentMap = {
      component2: {
        localZipFile: 'string',
        buildVersion: 'string',
        version: '1.1.3',
        zip_prefix: 'string',
        zip_branch: 'string',
        zip_path: 'string',
        build_type: 'string',
        build_artifact_path: 'string',
      },
      component1: {
        localZipFile: 'dist/mybuild.zip',
        buildVersion: '1.0.0.456',
        version: '1.0.0',
        zip_prefix: 'prefix',
        zip_branch: 'main',
      },
    };

    const targetEnvParams = {
      componentMap,
      componentVersion: '1.0.0',
      versionRoot: '1.0',
      branch: 'main',
      s3AssetsBucket: 'my-bucket',
      s3AssetsPathRoot: 'assets',
      distPrefix: 'prefix',
    };
    const result = buildTargetEnv(targetEnvParams);

    expect(result).toMatchInlineSnapshot(`
			{
			  "components": {
			    "component1": {
			      "buildVersion": "1.0.0.456",
			      "build_type": "",
			      "localZipFile": "dist/mybuild.zip",
			      "version": "1.0.0",
			      "zip_branch": "main",
			      "zip_prefix": "prefixcomponent1-",
			    },
			    "component2": {
			      "buildVersion": "string",
			      "build_artifact_path": "string",
			      "build_type": "string",
			      "localZipFile": "string",
			      "version": "1.0.0",
			      "zip_branch": "main",
			      "zip_path": "string",
			      "zip_prefix": "prefixcomponent2-",
			    },
			  },
			  "s3_assets_bucket": "my-bucket",
			  "s3_assets_path_root": "assets",
			  "version_root": "1.0",
			}
		`);
  });
});
