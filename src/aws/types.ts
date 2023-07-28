import type { Readable } from 'stream';

export interface S3Location {
    Bucket: string;
    Key: string;
}

export interface Upload {
  Body: Readable | ReadableStream | Blob | string | Uint8Array | Buffer;
  Bucket: string;
  Key: string;
  ACL?: string;
}
