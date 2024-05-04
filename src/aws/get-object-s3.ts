import fs from 'node:fs';
import {promisify} from 'node:util';
import {pipeline, type Readable} from 'node:stream';
import {GetObjectCommand, ListObjectsV2Command} from '@aws-sdk/client-s3';
import type {SdkStreamMixin} from '@aws-sdk/types';
import {getS3Client} from './s3-client';
import {StreamCounter} from './stream-counter';
import type {S3Location} from './types';

const pipelineP = promisify(pipeline);

function isReadable(
	body: Readable | ReadableStream | Blob | undefined,
): body is Readable {
	return body !== undefined && body && (body as Readable).read !== undefined;
}

/**
 * Stream to file, and return number of bytes saved to the file
 */
async function writeToFile(
	inputStream: Readable,
	filePath: string,
): Promise<number> {
	const counter = new StreamCounter();
	await pipelineP(inputStream, counter, fs.createWriteStream(filePath));
	return counter.totalBytesTransfered();
}

export async function getS3ObjectStream({
	Bucket,
	Key,
}: S3Location): Promise<Readable & SdkStreamMixin> {
	const parameters = {
		Bucket,
		Key,
	};
	try {
		const x = await getS3Client().send(new GetObjectCommand(parameters));
		const Body = x.Body;
		if (isReadable(Body)) {
			return Body;
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new TypeError(
				`Could not retrieve from bucket 's3://${Bucket}/${Key}' from S3: ${error.message}`,
			);
		} else {
			throw error;
		}
	}

	throw new Error(`Could not read file from bucket. 's3://${Bucket}/${Key}'`);
}

export async function getS3Object(
	location: S3Location,
	defaultValue?: string,
): Promise<string> {
	try {
		const stream = await getS3ObjectStream(location);
		return await stream.transformToString();
	} catch (error) {
		if (defaultValue) {
			return defaultValue;
		}

		const message = error instanceof Error ? error.message : String(error);
		throw new Error(
			`Could not retrieve from bucket 's3://${location.Bucket}/${location.Key}' from S3: ${message}`, {cause: error},
		);
	}
}

export async function writeS3ObjectToFile(
	location: S3Location,
	filename: string,
): Promise<number> {
	try {
		return await writeToFile(await getS3ObjectStream(location), filename);
	} catch (error) {
		if (error instanceof Error) {
			throw new TypeError(
				`Could not retrieve from bucket 's3://${location.Bucket}/${location.Key}'. Error was: ${error.message}`,
			);
		} else {
			throw error;
		}
	}
}

export async function listS3Objects({
	Bucket,
	Key,
}: S3Location): Promise<string[]> {
	try {
		const parameters = {
			Bucket,
			Key,
		};

		const data = await getS3Client().send(new ListObjectsV2Command(parameters));

		return data.Contents?.map(element => element.Key ?? '') ?? [];
	} catch (error_) {
		const error = error_ instanceof Error ? new Error(`Could not list files in S3: ${error_.name} ${error_.message}`) : error_;
		throw error;
	}
}
