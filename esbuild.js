const esbuild = require('esbuild');

const __DEV__ = process.env.NODE_ENV === 'development';
const __PROD__ = process.env.NODE_ENV === 'production';

// ESM - Currently disabled as CommonJS named exports seem to work pretty well with ESM based imports
/*esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outdir: 'dist',
    bundle: true,
    sourcemap: true,
    minify: true,
    splitting: true,
    format: 'esm',
    target: ['esnext']
  })
  .catch(() => process.exit(1));*/

// CJS
esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    format: 'cjs',
    bundle: true,
    sourcemap: __DEV__,
    minify: __PROD__,
    platform: 'node',
    // ????
    // there's no node14.X option https://esbuild.github.io/api/#target
    target: ['node14.16']
  })
  .catch(() => process.exit(1));
