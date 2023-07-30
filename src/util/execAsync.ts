import process from 'node:process';
import {exec, type ExecOptions} from 'node:child_process';

export type AsyncExecOptions = {
	log?: boolean;
};

// Async wrapper around child_process.exec()
export async function execAsync(
	command: string,
	options: AsyncExecOptions & ExecOptions = {},
): Promise<{stdout: string; stderr: string}> {
	const log = options?.log ?? process.env.DEBUG_EXEC === 'true';
	if (log) {
		console.error(command);
	}

	return new Promise((done, failed) => {
		exec(command, {...options}, (error, stdout, stderr) => {
			if (log) {
				console.error(`Output from ${command} was:\n${stdout}`);
			}

			if (error) {
				failed(error);
				return;
			}

			done({stdout, stderr});
		});
	});
}

/**
 * Read a string from the stdout of another process
 */
export async function execStr(
	command: string,
	options: AsyncExecOptions & ExecOptions = {},
): Promise<string> {
	const proc = await execAsync(command, options);
	return proc.stdout.trim();
}
