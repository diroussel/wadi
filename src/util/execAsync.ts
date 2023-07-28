/* eslint-disable no-param-reassign,no-console */
import { exec, type ExecOptions } from 'child_process';

export type AsyncExecOptions = {
  log?: boolean;
};

// async wrapper around child_process.exec()
export async function execAsync(
  command: string,
  options: AsyncExecOptions & ExecOptions = {}
): Promise<{ stdout: string; stderr: string }> {
  const log = options?.log || process.env.DEBUG_EXEC === 'true';
  if (log) console.error(command);
  return new Promise((done, failed) => {
    exec(command, { ...options }, (err, stdout, stderr) => {
      if (log) {
        console.error(`Output from ${command} was:\n${stdout}`);
      }
      if (err) {
        failed(err);
        return;
      }
      done({ stdout, stderr });
    });
  });
}

/**
 * Read a string from the stdout of another process
 */
export async function execStr(
  command: string,
  options: AsyncExecOptions & ExecOptions = {}
): Promise<string> {
  return (await execAsync(command, options)).stdout.trim();
}
