import {Readable} from "node:stream";
import yauzl from "yauzl-promise";

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
	// lets have a ReadableStream as a stream variable
	const chunks = [];

	for await (const chunk of stream) {
		chunks.push(Buffer.from(chunk));
	}

	return Buffer.concat(chunks);
}

export async function readFileContentsFromZipFile(zipfile: string, filename: string) : Promise<Buffer> {
	const zip1 = await yauzl.open(zipfile);
	try {
		for await (const entry of zip1) {
			if (entry.filename === filename) {
				const readStream = await entry.openReadStream();
				return streamToBuffer(readStream);
			}
		}
	} finally {
		await zip1.close();
	}
	throw new Error(`File ${filename} not found in archive ${zipfile}`);
}
