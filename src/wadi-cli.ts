#!/usr/bin/env ts-node

import yargs from 'yargs/yargs';
import { downloadArtifactsCommand } from './commands/download-artifacts/download-artifacts-command';
import { generateOpenapi3VarmapCommand } from './commands/generate-openapi3-varmap/generate-openapi3-varmap-command';
import { generateTargetEnvCmd } from './commands/generate-target-env/generate-target-env-command';

export async function wadi(args: string[], exitProcess = true): Promise<void> {
  await yargs(args)
    .usage('wadi <command> [args]')
    .scriptName('wadi')
    .command(downloadArtifactsCommand)
    .command(generateOpenapi3VarmapCommand)
    .command(generateTargetEnvCmd)
    .recommendCommands()
    .exitProcess(exitProcess)
    .help()
    .demandCommand(
      1,
      'You need to specify a command.  Or run "wadi <command> --help" for a description of the arguments\n\n',
    )
    .strict()
    .wrap(150)
    .parseAsync();
}
