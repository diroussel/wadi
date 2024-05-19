import {join} from 'node:path';
import {readFileContentsFromZipFile} from '../../util/read-zip';

describe('readFileContentsFromZipFile', () => {
	it('returns zip file', async () => {
		const contents = await readFileContentsFromZipFile(join(__dirname, 'test.zip'), 'test.txt');
		expect(contents).toEqual('hello\n');
	});
});
