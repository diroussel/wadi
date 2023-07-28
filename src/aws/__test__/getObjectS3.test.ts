import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';
import {
  getS3Object,
  listS3Objects,
  writeS3ObjectToFile,
} from '../getObjectS3';

let mockSend = jest.fn();
jest.mock('../s3Client', () => ({
  getS3Client: jest.fn(() => ({ send: mockSend })),
}));

describe('getS3Object', () => {
  afterEach(jest.clearAllMocks);

  it('Should throw an error if invalid key', async () => {
    mockSend.mockImplementationOnce(() => {
      throw new Error('No file found');
    });

    await expect(
      getS3Object({
        Bucket: 'bucket-name',
        Key: 'config.test.json',
      })
    ).rejects.toThrowError(
      "Could not retrieve from bucket 's3://bucket-name/config.test.json' from S3: Could not retrieve from bucket 's3://bucket-name/config.test.json' from S3: No file found"
    );
  });

  it('Should return config', async () => {
    const result = JSON.stringify({
      featureFlags: {
        testFlag: true,
      },
    });

    mockSend.mockReturnValueOnce({Body: Readable.from([result])});

    const data = await getS3Object({
      Bucket: 'bucket-name',
      Key: 'config.test.json',
    });

    expect(data).toEqual(result);
  });

  it('Should return default when object does not exist', async () => {
    const defaultValue = 'the default value';

    mockSend.mockImplementationOnce(() => {
      throw new Error('not found');
    });

    const data = await getS3Object(
      {
        Bucket: 'bucket-name',
        Key: 'config.test.json',
      },
      defaultValue
    );

    expect(data).toEqual(defaultValue);
  });
});

describe('listS3Objects', () => {
  it('Should throw an error if invalid key', async () => {
    mockSend.mockImplementationOnce(() => {
      throw new Error('No file found');
    });

    await expect(
      listS3Objects({
        Bucket: 'bucket-name',
        Key: 'config.test.json',
      })
    ).rejects.toThrowError('Could not list files in S3: Error No file found');
  });

  it('Should return key', async () => {
    mockSend.mockImplementationOnce(() => ({Contents: [{Key: 'KEY'}]}));

    const result = await listS3Objects({
      Bucket: 'bucket-name',
      Key: 'config.test.json',
    });

    expect(result).toMatchInlineSnapshot(`
      [
        "KEY",
      ]
    `);
  });
});

describe('writeS3ObjectToFile', () => {
  it('should write data to a file', async () => {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'writeS3ObjectToFile-test')
    );

    const filename = path.join(tmpDir, 'test1.txt');

    const result = 'The cat sat on the mat';

    mockSend.mockReturnValueOnce({Body: Readable.from([result])});

    const count = await writeS3ObjectToFile(
      {
        Bucket: 'bucket-name',
        Key: 'config.test.json',
      },
      filename
    );

    expect(count).toEqual(result.length);

    // Read file back in
    const data = (await fs.readFile(filename)).toString('utf-8');

    expect(data).toEqual(result);
  });
});
