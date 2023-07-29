import { glob } from 'glob';
import path from 'path';
import type { PkgJson, ComponentList } from '../types/gully-types';
import { readJsonFile } from './parseJson';

export async function getComponents(
  projRootDir: string
): Promise<ComponentList> {
  const rootPkgJson = await readJsonFile<PkgJson>(
    `${projRootDir}/package.json`
  );
  if (!rootPkgJson?.workspaces) {
    throw new Error('workspaces not found');
  }
  const workspaces = rootPkgJson.workspaces.join(',');
  const paths = await glob(`${projRootDir}/{${workspaces}}/package.json`, {
    ignore: '**/node_modules/**',
  });

  const pkgJsons = await Promise.all(
    paths.map(async (packagePath) => ({
      path: packagePath,
      data: await readJsonFile<PkgJson>(packagePath),
    }))
  );

  return pkgJsons.flatMap((pkgJson) => {
    const packagePath = path.dirname(pkgJson.path);

    return (pkgJson.data?.componentNames ?? []).map((componentName) => ({
      componentName,
      packagePath,
    }));
  });
}
