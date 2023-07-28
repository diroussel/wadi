/* eslint-disable unicorn/prefer-type-error */
import fs from 'fs';
import { promisify } from 'util';
import { pipeline, type Readable } from 'stream';
import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getS3Client } from './s3Client';
import { StreamCounter } from './stream-counter';
import type { S3Location } from "./types";

const pipelineP = promisify(pipeline);

function isReadable(
  body: Readable | ReadableStream | Blob | undefined
): body is Readable {
  return body !== undefined && body && (body as Readable).read !== undefined;
}

export async function streamToString(Body: Readable) {
  return await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    Body.on('data', (chunk: ArrayBuffer | SharedArrayBuffer) =>
      chunks.push(Buffer.from(chunk))
    );
    Body.on('error', (err) => reject(err));
    Body.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

/**
 * Stream to file, and return number of bytes saved to the file
 */
async function writeToFile(
  inputStream: Readable,
  filePath: string
): Promise<number> {
  const counter = new StreamCounter();
  await pipelineP(inputStream, counter, fs.createWriteStream(filePath));
  return counter.totalBytesTransfered();
}

export async function getS3ObjectStream({
  Bucket,
  Key,
}: S3Location): Promise<Readable> {
  const params = {
    Bucket,
    Key,
  };
  try {
    const { Body } = await getS3Client().send(new GetObjectCommand(params));

    // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
    if (isReadable(Body)) {
      return Body;
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(
        `Could not retrieve from bucket 's3://${Bucket}/${Key}' from S3: ${e.message}`
      );
    } else {
      throw e;
    }
  }
  throw new Error(`Could not read file from bucket. 's3://${Bucket}/${Key}'`);
}

export async function getS3Object(
  location: S3Location,
  defaultValue?: string
): Promise<string> {
  try {
    return await streamToString(await getS3ObjectStream(location));
  } catch (e) {
    if (defaultValue) {
      return defaultValue;
    }

    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Could not retrieve from bucket 's3://${location.Bucket}/${location.Key}' from S3: ${msg}`
    );
  }
}

export async function writeS3ObjectToFile(
  location: S3Location,
  filename: string
): Promise<number> {
  try {
    return await writeToFile(await getS3ObjectStream(location), filename);
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(
        `Could not retrieve from bucket 's3://${location.Bucket}/${location.Key}'. Error was: ${e.message}`
      );
    } else {
      throw e;
    }
  }
}

export async function listS3Objects({
  Bucket,
  Key,
}: S3Location): Promise<string[]> {
  try {
    const params = {
      Bucket,
      Key,
    };

    const data = await getS3Client().send(new ListObjectsV2Command(params));

    return data.Contents?.map((element) => element.Key || '') ?? [];
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(`Could not list files in S3: ${e.name} ${e.message}`);
    } else {
      throw e;
    }
  }
}
