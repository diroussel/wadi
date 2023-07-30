import { defineConfig } from 'tsup'

export default defineConfig({
  clean: true,
  entry: ['src/wadi.ts'],
  metafile: true,
  noExternal: [ /.*/ ],
  outDir: 'target/bundle',
  sourcemap: true,
  splitting: false,
  treeshake: true,
  format: ["esm", "cjs"]
})
