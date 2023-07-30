import type {Buffer} from 'node:buffer';
import type {Readable} from 'node:stream';

export type S3Location = {
	Bucket: string;
	Key: string;
};

export type Upload = {
	Body: Readable | ReadableStream | Blob | string | Uint8Array | Buffer;
	Bucket: string;
	Key: string;
	ACL?: string;
};
