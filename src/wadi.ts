#!/usr/bin/env node
import process from 'node:process';
import {wadi} from './wadi-cli';

try {
	await wadi(process.argv.slice(2));
} catch (error) {
	console.error('failed:', error);
	process.exitCode = 1;
}
