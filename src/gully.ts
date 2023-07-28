#!/usr/bin/env node
/* eslint-disable no-console */
import { gully } from './gully-cli';

gully(process.argv.slice(2)).catch((error) => {
  console.error('failed:', error);
  process.exit(1);
});
