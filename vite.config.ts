import react from '@vitejs/plugin-react'
import { build } from 'esbuild'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  const define = {
    'process.env.NODE_ENV': JSON.stringify(mode)
  }

  return {
    plugins: [
      react(),
      {
        name: 'build-content-script',
        async writeBundle() {
          await build({
            entryPoints: ['src/pageContent/contentScript.ts'],
            bundle: true,
            outfile: `dist/contentScript.js`,
            format: 'iife',
            minify: true,
            target: 'es2020',
            loader: {
              '.ts': 'ts',
              '.tsx': 'tsx'
            },
            tsconfig: 'tsconfig.app.json',
            define
          })
        }
      }
    ],
    build: {
      outDir: `dist`,
      minify: isDevelopment ? false : 'esbuild',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
          background: resolve(__dirname, `src/server/index.ts`)
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: isDevelopment ? 'assets/[name].js' : 'assets/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name) {
              if (assetInfo.name.endsWith('.css')) return 'assets/styles/[name][extname]'
              if (/\.(gif|jpe?g|png|svg|webp)$/.test(assetInfo.name))
                return 'assets/images/[name][extname]'
              if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name))
                return 'assets/fonts/[name][extname]'
            }
            return 'assets/[name][extname]'
          }
        }
      },
      target: 'esnext',
      sourcemap: isDevelopment
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    define
  }
})
