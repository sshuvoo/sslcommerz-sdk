import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'node',
  target: 'node18',
  shims: true,
  treeshake: true,
  sourcemap: true,
  minify: false,
  outExtensions() {
    return {
      js: '.js',
    }
  },
  deps: {
    alwaysBundle: ['form-data', 'node-fetch'],
  },
})
