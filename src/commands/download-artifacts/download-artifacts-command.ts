/* eslint-disable @typescript-eslint/ban-types */
import type { WadiCommandDef } from '../../types/wadi-types';
import { downloadArtifactsHandler } from './download-artifacts-handler';

export type DownloadArtifactsCliArgs = {
  targetEnvJsonPath: string;
  outputFolder: string;
  buildTypes: string;
  concurrency: number;
};

export const downloadArtifactsCommand: WadiCommandDef<{}, DownloadArtifactsCliArgs> = {
  command: 'download-artifacts',
  describe:
    'Download component artifacts that are listed in target-env.json, and set the localZipFile attribute for each completed download',
  builder: {
    targetEnvJsonPath: {
      type: 'string',
      description: 'path to target-env.json',
      default: 'target-env.json',
    },
    outputFolder: {
      type: 'string',
      description: 'path to output folder, where the component zip files should be saved',
    },
    concurrency: {
      type: 'number',
      description: 'The max number of downloads to do in parallel',
      default: 8,
    },
    buildTypes: {
      type: 'string',
      description:
        'Comma separated list. Only download zip files for components of the types listed. e.g. lambda,apigateway,static_asset',
    },
  },
  handler: downloadArtifactsHandler,
};
