#!/usr/bin/env ts-node
/* eslint-disable no-console */
import yargs from 'yargs/yargs';
import { generateTargetEnvCmd } from './commands/generate-target-env/generate-target-env-command';
import { generateOpenapi3VarmapCommand } from './commands/generate-openapi3-varmap/generate-openapi3-varmap-command';
import { downloadArtifactsCommand } from './commands/download-artifacts/download-artifacts-command';

export async function gully(args: string[], exitProcess = true): Promise<void> {
  await yargs(args)
    .usage('gully <command> [args]')
    .scriptName('gully')
    .command(downloadArtifactsCommand)
    .command(generateOpenapi3VarmapCommand)
    .command(generateTargetEnvCmd)
    .recommendCommands()
    .exitProcess(exitProcess)
    .help()
    .demandCommand(
      1,
      'You need to specify a command.  Or run "gully <command> --help" for a description of the arguments\n\n'
    )
    .strict()
    .wrap(150)
    .parseAsync();
}
