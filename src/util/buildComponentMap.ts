import {glob} from 'glob';
import type {ComponentMap} from '../types/gully-types';
import {getComponents} from './getComponents';

export async function buildComponentMap(
	addLocalZipPath: boolean,
	projRootDir: string,
): Promise<ComponentMap> {
	const componentList = await getComponents(projRootDir);

	const componentMap: ComponentMap = Object.fromEntries(
		await Promise.all(
			componentList.map(async ({componentName, packagePath}) => {
				if (addLocalZipPath) {
					const localPath = await glob(
						`${packagePath}/target/dist/DistPrefix.${componentName}-*.zip`,
					);
					if (localPath.length !== 1) {
						throw new Error(`Local zip not found, packagePath: ${packagePath}`);
					}

					return [componentName, {localZipFile: localPath[0]}];
				}

				return [componentName, {}];
			}),
		),
	);
	return componentMap;
}
