import path from 'node:path';
import {glob} from 'glob';
import pMap from 'p-map';
import type {PkgJson, ComponentList} from '../types/wadi-types';
import {readJsonFile} from './parse-json';
import {execStr} from './exec-async';

async function listComponentsInPackage(packageJsonPath: string): Promise<ComponentList> {
	const fileData = await readJsonFile<PkgJson>(packageJsonPath);
	const packagePath = path.dirname(packageJsonPath);

	const names = fileData.componentNames ?? (fileData.componentName ? [fileData.componentName] : []);
	return names.map(componentName => ({componentName, packagePath}));
}

type PnpmListItem = {
	name: string;
	version: string;
	path: string;
	private: boolean;
};

async function findAllPkgJsonInWorkspace(projRootDir: string, appPrefix: string) {
	const rootPkgJson = await readJsonFile<PkgJson>(`${projRootDir}/package.json`);
	const workspaces = rootPkgJson?.workspaces?.join(',');
	if (workspaces) {
		return await glob(`${projRootDir}/{${workspaces}}/package.json`, {ignore: '**/node_modules/**'});
	}

	// No yarn workspaces found, so look for pnpm workspaces
	try {
		const command = `cd '${projRootDir}'; pnpm ls --filter './${appPrefix}/**' --json --depth -1`;
		const stdout = await execStr(command);
		if (stdout.charAt(0) === '[') {
			const packages = JSON.parse(stdout) as PnpmListItem[];
			if (packages) {
				return packages.map(({path}) => `${path}/package.json`);
			}
		} else {
			throw new Error(`Failed to list packages.\n${stdout}`);
		}
	} catch (error) {
		throw new Error(`workspaces not found. Error: ${String(error)}`, { cause: error});
	}

	throw new Error('workspaces not found');
}

export async function getComponents(
	projRootDir: string,
	appPrefix: string,
): Promise<ComponentList> {
	const paths = await findAllPkgJsonInWorkspace(projRootDir, appPrefix);

	const list = await pMap(paths, listComponentsInPackage, {concurrency: 3});
	return list.flat();
}
