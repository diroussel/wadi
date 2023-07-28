/* eslint-disable no-console */
import type {Readable} from 'stream';
import { PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { getS3Client } from './s3Client';
import type { Upload, S3Location } from "./types";

export async function putDataS3(
  fileData: Record<string, unknown>,
  {Bucket, Key}: S3Location
): Promise<PutObjectCommandOutput> {
  try {
    const params = {
      Bucket,
      Key,
      Body: JSON.stringify(fileData, null, 2),
    };

    const data = getS3Client().send(new PutObjectCommand(params));
    console.log(`Data uploaded to ${Bucket}/${Key}`);
    return data;
  } catch (err) {
    throw new Error(`Upload to ${Bucket}/${Key} failed, error: ${err}`);
  }
}



/**
 * Upload a stream, string or blob to as an S3 object.
 *
 *
 * @param params
 * @param log
 *
 * @example
 *    await uploadObjectToS3({
 *       Bucket: s3AssetsBucket,
 *       Key: remotePath,
 *       Body: data,
 *       ACL: 'bucket-owner-full-control',
 *     });
 */
export async function uploadObjectToS3(
  params: Upload,
  log: {
    info: (msg: string | object) => void;
    error: (msg: string | object) => void;
  }
): Promise<PutObjectCommandOutput> {
  try {
    log.info(`Starting upload to s3://${params.Bucket}/${params.Key}`);
    return await getS3Client().send(new PutObjectCommand(params));
  } catch (error) {
    if (error instanceof Error) {
      const newMessage = `Upload to ${params.Bucket}/${params.Key} failed, error: ${error.message}`;
      log.error({
        description: newMessage,
        message: error.message,
        stack: error.stack,
      });
      throw new Error(newMessage);
    } else {
      throw error;
    }
  }
}
