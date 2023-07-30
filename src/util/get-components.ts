import path from 'node:path';
import {glob} from 'glob';
import type {PkgJson, ComponentList} from '../types/wadi-types';
import {readJsonFile} from './parse-json';

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

	const pkgJsons = await Promise.all(
		paths.map(async packagePath => ({
			path: packagePath,
			data: await readJsonFile<PkgJson>(packagePath),
		})),
	);

	return pkgJsons.flatMap(pkgJson => {
		const packagePath = path.dirname(pkgJson.path);

		return (pkgJson.data?.componentNames ?? []).map(componentName => ({
			componentName,
			packagePath,
		}));
	});
}
