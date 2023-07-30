#!/usr/bin/env node
import process from 'node:process';
import {gully} from './wadi-cli';

try {
	await gully(process.argv.slice(2));
} catch (error) {
	console.error('failed:', error);
	process.exitCode = 1;
}
