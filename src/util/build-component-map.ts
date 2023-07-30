import pMap from 'p-map';
import {glob} from 'glob';
import type {ComponentList, ComponentLocation, ComponentMap} from '../types/wadi-types';
import {getComponents} from './get-components';

export async function buildComponentMap(
	addLocalZipPath: boolean,
	projRootDir: string,
): Promise<ComponentMap> {
	const findLocalZip = async ({componentName, packagePath}: ComponentLocation): Promise<[string, {localZipFile?: string}]> => {
		if (!addLocalZipPath) {
			return [componentName, {}];
		}

		const localPath = await glob(
			`${packagePath}/target/dist/DistPrefix.${componentName}-*.zip`,
		);
		if (localPath.length === 0) {
			throw new Error(`Local zip not found, packagePath: ${packagePath}`);
		}

		if (localPath.length !== 1) {
			throw new Error(`Too many zips found, packagePath: ${packagePath}`);
		}

		return [componentName, {localZipFile: localPath[0]}];
	};

	const componentList = await getComponents(projRootDir);
	return Object.fromEntries(await pMap(componentList, findLocalZip, {concurrency: 4}));
}
