import pMap from 'p-map';
import {glob} from 'glob';
import type {ComponentLocation, ComponentMap} from '../types/wadi-types';
import {getComponents} from './get-components';

export async function buildComponentMap(
	addLocalZipPath: boolean,
	projRootDir: string,
	distPrefix: string,
	appPrefix: string,
): Promise<ComponentMap> {
	const findLocalZip = async ({componentName, packagePath}: ComponentLocation): Promise<[string, {localZipFile?: string}]> => {
		if (!addLocalZipPath) {
			return [componentName, {}];
		}

		const pattern = `${packagePath}/target/dist/${distPrefix}${componentName}-*.zip`;
		const localPath = await glob(pattern);
		if (localPath.length === 0) {
			throw new Error(`Local zip not found. No file found matching pattern: ${pattern}`);
		}

		if (localPath.length !== 1) {
			throw new Error(`Too many zips found, packagePath: ${packagePath}`);
		}

		return [componentName, {localZipFile: localPath[0]}];
	};

	const componentList = await getComponents(projRootDir, appPrefix);
	return Object.fromEntries(await pMap(componentList, findLocalZip, {concurrency: 4}));
}
