import { Transform, type TransformCallback } from 'stream';

/**
 * Duplex (Transform) stream that counts the number of bytes that pass through it.
 *
 * The data itself is pushed through as-is.
 */
export class StreamCounter extends Transform {
  private totalBytes = 0;

  /**
   * Get the total of all bytes transfered
   */
  totalBytesTransfered(): number {
    return this.totalBytes;
  }

  override _transform(
    chunk: any,
    encoding: BufferEncoding,
    cb: TransformCallback
  ): void {
    if (chunk != null && typeof chunk.length === 'number') {
      this.totalBytes += chunk.length as number;
    }

    cb(null, chunk);
  }
}
