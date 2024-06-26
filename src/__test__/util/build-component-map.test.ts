import { glob } from 'glob';
import { buildComponentMap } from '../../util/build-component-map';
import { getComponents } from '../../util/get-components';

jest.mock('glob');
jest.mock('../../util/get-components');
const globMock = jest.mocked(glob);

globMock.mockResolvedValue(['zip']);

(getComponents as jest.Mock).mockResolvedValue([
  { componentName: 'lambda', packagePath: 'this/path' },
  { componentName: 'package', packagePath: 'that/path' },
  { componentName: 'tool', packagePath: 'and/third/one' },
]);

describe('buildComponentMap', () => {
  describe('addLocalZipPath arg is true', () => {
    it('glob will be called with name and path from each component returned by getComponents', async () => {
      await buildComponentMap(true, 'rootDirPath', 'DistPrefix.', '');

      expect(glob).toBeCalledTimes(3);

      expect(glob).toBeCalledWith('this/path/target/dist/DistPrefix.lambda-*.zip');
      expect(glob).toBeCalledWith('that/path/target/dist/DistPrefix.package-*.zip');
      expect(glob).toBeCalledWith('and/third/one/target/dist/DistPrefix.tool-*.zip');
    });

    it('if no zip is found, an error is thrown', async () => {
      globMock.mockResolvedValueOnce([]);
      await expect(async () =>
        buildComponentMap(true, 'rootDirPath', 'DistPrefix.', ''),
      ).rejects.toThrowError(
        'Local zip not found. No file found matching pattern: this/path/target/dist/DistPrefix.lambda-*.zip',
      );
    });

    it('if more than one zip is found, an error is thrown', async () => {
      globMock.mockResolvedValueOnce(['firstZip', 'andSecond']);

      await expect(async () =>
        buildComponentMap(true, 'rootDirPath', 'DistPrefix.', ''),
      ).rejects.toThrowError('Too many zips found, packagePath: this/path');
    });

    it('ComponentMap includes localZipFile', async () => {
      globMock.mockResolvedValueOnce(['zip']);
      globMock.mockResolvedValueOnce(['two']);
      globMock.mockResolvedValueOnce(['three']);

      expect(await buildComponentMap(true, 'rootDirPath', 'DistPrefix.', '')).toEqual({
        lambda: {
          localZipFile: 'zip',
        },
        package: {
          localZipFile: 'two',
        },
        tool: {
          localZipFile: 'three',
        },
      });
    });
  });

  it('if addLocalZipPath is false, ComponentMap values are empty objects', async () => {
    globMock.mockResolvedValueOnce(['zip']);

    expect(await buildComponentMap(false, 'rootDirPath', 'DistPrefix.', '')).toEqual({
      lambda: {},
      package: {},
      tool: {},
    });
  });
});
