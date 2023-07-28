import type { CommandModule, Options } from 'yargs';

/**
 * Add type constraint to CommandModule so that we ensure all args are specified
 */
export interface GullyCommandDef<T, U> extends CommandModule<T, U> {
  builder: Record<keyof U, Options>;
}

export type ComponentData = {
  localZipFile?: string;
  buildVersion?: string;
  version?: string;
  zip_prefix?: string;
  zip_branch?: string;
  zip_path?: string;
  build_type?: string;
  build_artifact_path?: string;
};

export type TargetEnvFile = {
  version_root: string;
  s3_assets_bucket: string;
  s3_assets_path_root: string;
  components: Record<string, ComponentData>;
};

export type ComponentMap = Record<string, ComponentData>;

export type ComponentList = { componentName: string; packagePath: string }[];

export type PkgJson = {
  componentNames?: string[];
  version: string;
  workspaces?: string[];
};

export type FunctionGroup = [
  { name: string; apifullpath: string[]; handler: string }
];

export type LambdaMappings = { lambda_function_group: FunctionGroup };
