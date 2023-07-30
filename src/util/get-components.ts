import path from 'node:path';
import {glob} from 'glob';
import pMap from 'p-map';
import type {PkgJson, ComponentList, ComponentLocation} from '../types/wadi-types';
import {readJsonFile} from './parse-json';

async function listComponentsInPackage(packageJsonPath: string): Promise<ComponentList> {
	const fileData = await readJsonFile<PkgJson>(packageJsonPath);
	const packagePath = path.dirname(packageJsonPath);

	const names = fileData.componentNames ?? (fileData.componentName ? [fileData.componentName] : []);
	return names.map(componentName => ({componentName, packagePath}));
}

export async function getComponents(
	projRootDir: string,
): Promise<ComponentList> {
	const rootPkgJson = await readJsonFile<PkgJson>(
		`${projRootDir}/package.json`,
	);
	if (!rootPkgJson?.workspaces) {
		throw new Error('workspaces not found');
	}

	const workspaces = rootPkgJson.workspaces.join(',');
	const paths = await glob(`${projRootDir}/{${workspaces}}/package.json`, {
		ignore: '**/node_modules/**',
	});

	const list = await pMap(paths, listComponentsInPackage, {concurrency: 3});
	return list.flat();
}
