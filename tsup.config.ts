import {defineConfig} from 'tsup';

export default defineConfig({
	clean: true,
	entry: ['src/wadi.ts'],
	metafile: true,
	// NoExternal: [/.*/],
	outDir: 'target/bundle',
	sourcemap: true,
	splitting: false,
	// Treeshake: true,
	format: ['esm', 'cjs'],
});
