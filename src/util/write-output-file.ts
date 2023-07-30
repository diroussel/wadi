import {writeFile} from 'node:fs/promises';

export async function writeOutputFile(
	jsonOutput: string,
	varMap: Record<string, unknown>,
) {
	await writeFile(jsonOutput, JSON.stringify(varMap, null, 2));
}
