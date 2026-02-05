import { build } from 'bun';

console.log('Building preload script (CJS)...');

const result = await build({
  entrypoints: ['./src/main/preload.ts'],
  outdir: './dist',
  naming: 'preload.js', // Output as .js
  format: 'cjs',        // FORCE CommonJS for Electron compatibility
  target: 'node',
  external: ['electron'],
});

if (result.success) {
  console.log('Preload build successful!');
} else {
  console.error('Preload build failed:', result.logs);
  process.exit(1);
}
