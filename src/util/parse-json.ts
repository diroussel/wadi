import type {Buffer} from 'node:buffer';
import {readFile} from 'node:fs/promises';
import type {TargetEnvFile} from '../types/wadi-types';

/**
 * Read some JSON and cast to the supplied type. Not very safe, but safe enough
 */
export function parseJson<T>(buffer: Buffer): T {
	return JSON.parse(buffer.toString('utf8')) as T;
}

export async function readJsonFile<T>(path: string): Promise<T> {
	return parseJson<T>(await readFile(path));
}

export async function readTargetEnvJson(
	targetEnvJsonPath: string,
): Promise<TargetEnvFile> {
	const targetEnvJson = parseJson<TargetEnvFile>(
		await readFile(targetEnvJsonPath),
	);

	if (!targetEnvJson.components) {
		throw new Error(
			`"components" element not found in json, see '${targetEnvJsonPath}'`,
		);
	}

	return targetEnvJson;
}
