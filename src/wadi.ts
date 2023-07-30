#!/usr/bin/env node
import process from 'node:process';
import {gully} from './wadi-cli';

gully(process.argv.slice(2)).catch(error => {
	console.error('failed:', error);
	process.exit(1);
});
