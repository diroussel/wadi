import {readFile} from 'node:fs/promises';
import {type PutObjectCommandOutput} from '@aws-sdk/client-s3';
import {uploadComponentZipFiles} from '../../../util/upload-component-zip-files';
import {uploadObjectToS3} from '../../../aws/put-data-s3';
import {type TargetEnvParams} from '../../../commands/common-args/target-env-args';

jest.mock('node:fs/promises');
jest.mock('../../../aws/put-data-s3');

describe('uploadComponentZipFiles', () => {
	it('should upload all component zip files to S3', async () => {
		const parameters: TargetEnvParams = {
			componentVersion: '1.2.3',
			versionRoot: '1.2',
			branch: 'main',
			s3AssetsBucket: 'test-bucket',
			s3AssetsPathRoot: 'artifacts/',
			distPrefix: 'app1',

			componentMap: {
				component1: {
					localZipFile: 'path/to/zip1.zip', zip_branch: 'main',
				},
				component2: {
					localZipFile: 'path/to/zip2.zip', zip_branch: 'main',
				},
			},
		};

		jest.mocked(readFile).mockResolvedValue(Buffer.from('dummy zip file content'));
		jest.mocked(uploadObjectToS3).mockResolvedValue({} as PutObjectCommandOutput);

		await uploadComponentZipFiles(parameters);

		expect(readFile).toHaveBeenCalledTimes(2);
		expect(uploadObjectToS3).toHaveBeenCalledTimes(2);
		expect(uploadObjectToS3).toHaveBeenCalledWith({
			Bucket: 'test-bucket',
			Key: 'artifacts/component1/main_1.2.3/buildartifact/zip1.zip',
			Body: Buffer.from('dummy zip file content'),
			ACL: 'bucket-owner-full-control',
		}, expect.anything());
		expect(uploadObjectToS3).toHaveBeenCalledWith({
			Bucket: 'test-bucket',
			Key: 'artifacts/component2/main_1.2.3/buildartifact/zip2.zip',
			Body: Buffer.from('dummy zip file content'),
			ACL: 'bucket-owner-full-control',
		}, expect.anything());
	});
});
