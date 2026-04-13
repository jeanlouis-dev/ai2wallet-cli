import { defineConfig } from 'tsup';

export default defineConfig({
    format: ['esm'],
    entry: ['./src/index.ts'],
    outDir: "./dist",
    sourcemap: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true
})