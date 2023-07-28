import type { TargetEnvParams } from '../commands/common-args/target-env-args';
import type { TargetEnvFile } from '../types/gully-types';

export function buildTargetEnv(params: TargetEnvParams): TargetEnvFile {
  const {
    componentMap,
    componentVersion,
    versionRoot,
    branch,
    s3AssetsBucket,
    s3AssetsPathRoot,
  } = params;

  // Find the build_type, in the future this should some from the component artifact-metadata.json
  function attributes(component: string) {
    let type = '';
    if (component.endsWith('static')) {
      type = 'static_asset';
    } else if (
      [
        'backchannellogoutlambda',
        'mockidplambda',
        'igflambda',
        'landingpagelambda',
        'bsamocklambda',
        'viewerapplambda',
        'candidatesdataapi',
        'notifycallbacklambda',
      ].includes(component)
    ) {
      type = 'apigateway';
    } else if (
      component.endsWith('lambda') ||
      component === 'dynamodb2sqs' ||
      component.includes('canary')
    ) {
      // TODO: rename dynamodb2sqs
      type = 'lambda';
    } else if (['gully'].includes(component)) {
      type = 'pipelineutils';
    } else if (
      component.endsWith('test') ||
      component.endsWith('e2e') ||
      component.endsWith('postdeploy')
    ) {
      type = 'postdeploy';
    } else if (component === 'terraform' || component === 'pipelinelocking') {
      type = 'deploy_sh';
    }
    return { build_type: type };
  }

  const components = Object.fromEntries(
    Object.entries(componentMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([component, componentData]) => [
        component,
        {
          ...attributes(component),
          ...componentData,
          version: componentVersion,
          zip_prefix: `NHSD.PopulationHealth.${component}-`,
          zip_branch: branch,
        },
      ])
  );

  return {
    version_root: versionRoot,
    s3_assets_bucket: s3AssetsBucket,
    s3_assets_path_root: s3AssetsPathRoot,
    components,
  };
}
