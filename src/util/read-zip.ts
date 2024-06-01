import type { Readable } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';
import yauzl from 'yauzl-promise';

async function readToSting(readable: Readable): Promise<string> {
  const decoder = new StringDecoder('utf8');
  let result = '';

  return new Promise((resolve, reject) => {
    readable.on('data', (chunk: Uint8Array) => {
      result += decoder.write(chunk);
    });

    readable.on('end', () => {
      result += decoder.end();
      resolve(result);
    });

    readable.on('error', (err) => {
      reject(err);
    });
  });
}

export async function readFileContentsFromZipFile(
  zipfile: string,
  filename: string,
): Promise<string> {
  const zipIter = await yauzl.open(zipfile);
  try {
    for await (const entry of zipIter) {
      if (entry.filename === filename) {
        const readable: Readable = await entry.openReadStream();
        const result = await readToSting(readable);
        readable.emit('close');
        return result;
      }
    }
  } finally {
    await zipIter.close();
  }

  throw new Error(`File ${filename} not found in archive ${zipfile}`);
}
