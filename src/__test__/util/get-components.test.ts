import {glob} from 'glob';
import {getComponents} from '../../util/get-components';
import {readJsonFile} from '../../util/parse-json';
import type {PkgJson} from '../../types/wadi-types';

jest.mock('../../util/parse-json');
jest.mock('glob');
const readJsonFileMock = jest.mocked(readJsonFile);
const globMock = jest.mocked(glob);

describe('getComponents', () => {
	it('an error is thrown if no workspaces can be read from root package.json', async () => {
		await expect(
			async () => getComponents('rootDir'),
		).rejects.toThrowError('workspaces not found');
	});

	it('glob should be called with workspaces, and projRootDir arg', async () => {
		readJsonFileMock.mockResolvedValueOnce({
			workspaces: ['workspaceDir1', 'workspaceDir2'],
		});

		globMock.mockResolvedValueOnce([]);

		await getComponents('testRootDirectory');

		expect(glob).toBeCalledWith(
			'testRootDirectory/{workspaceDir1,workspaceDir2}/package.json',
			{ignore: '**/node_modules/**'},
		);
	});

	it('readJsonFile will be called with each path returned by glob', async () => {
		readJsonFileMock.mockImplementation(async (path): Promise<PkgJson> => {
			switch (path) {
				case 'rootDir/package.json': {return {
					version: '1.0.0',
					workspaces: ['workspaceDir1'],
				};}

				case 'first/path/package.json': {return {
					version: '1.0.0',
					componentNames: ['frontendlambda', 'frontendstatic'],
				};}

				case 'and/second/path/package.json': {return {
					version: '1.0.0',
					componentName: 'app1lambda',
				};}

				default: {
					throw new Error(`Wasn't expecting path ${path}`);
				}
			}
		});
		globMock.mockResolvedValueOnce([
			'first/path/package.json',
			'and/second/path/package.json',
		]);

		const components = await getComponents('rootDir');
		expect(components).toMatchSnapshot();

		expect(readJsonFile).toBeCalledWith('first/path/package.json');
		expect(readJsonFile).toBeCalledWith('and/second/path/package.json');
	});

	it('if packageJson has no componentNames, it is not included in returned array', async () => {
		readJsonFileMock.mockResolvedValueOnce({
			workspaces: ['workspaceDir1'],
		});
		globMock.mockResolvedValueOnce([
			'first/path/package.json',
			'and/second/path/package.json',
		]);
		readJsonFileMock.mockResolvedValueOnce({
			componentNames: ['component'],
		});
		readJsonFileMock.mockResolvedValueOnce({});

		expect(await getComponents('rootDir')).toEqual([
			{componentName: 'component', packagePath: 'first/path'},
		]);
	});

	it('packages with multiple names result in multiple components with the same path', async () => {
		readJsonFileMock.mockResolvedValueOnce({
			workspaces: ['workspaceDir1'],
		});
		globMock.mockResolvedValueOnce(['first/path/package.json']);
		readJsonFileMock.mockResolvedValueOnce({
			componentNames: ['firstComponent', 'andSecondComponent'],
		});

		expect(await getComponents('rootDir')).toEqual([
			{componentName: 'firstComponent', packagePath: 'first/path'},
			{componentName: 'andSecondComponent', packagePath: 'first/path'},
		]);
	});
});
