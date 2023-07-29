import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['src/gully.ts'],
  metafile: true,
  noExternal: [ /.*/ ],
  outDir: 'target/bundle',
  sourcemap: true,
  splitting: false,
  treeshake: true,
})
