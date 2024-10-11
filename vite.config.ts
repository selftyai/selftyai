import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import { build } from 'esbuild'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'

import createManifest from './manifest'

const SUPPORTED_BROWSERS = ['chrome', 'opera']

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const [buildMode, browser] = mode.split(':')
  const isDevelopment = buildMode === 'development'

  if (!SUPPORTED_BROWSERS.includes(browser)) {
    throw new Error(`Unsupported browser: ${browser}`)
  }

  const define = {
    'process.env.BROWSER': JSON.stringify(browser)
  }

  return {
    plugins: [
      react(),
      {
        name: 'generate-manifest',
        writeBundle() {
          const manifest = createManifest(browser)
          writeFileSync(`dist/${browser}/manifest.json`, JSON.stringify(manifest, null, 2))
        }
      },
      {
        name: 'build-content-script',
        async writeBundle() {
          await build({
            entryPoints: ['src/pageContent/contentScript.tsx'],
            bundle: true,
            outfile: `dist/${browser}/contentScript.js`,
            format: 'iife',
            minify: true,
            target: 'es2020',
            loader: {
              '.ts': 'ts',
              '.tsx': 'tsx',
              '.svg': 'dataurl'
            },
            tsconfig: 'tsconfig.app.json',
            define
          })
        }
      },
      {
        name: 'build-content-script-styles',
        async writeBundle() {
          const inputCSS = 'src/shared/style/index.css'
          const outputCSS = `dist/${browser}/assets/contentScript.css`
          const tailwindConfig = 'src/pageContent/PageOverlay/tailwind.page-overlay.config.js'

          const css = readFileSync(inputCSS, 'utf8')

          // Run PostCSS with Tailwind CSS and Autoprefixer
          const result = await postcss([tailwindcss(tailwindConfig), autoprefixer]).process(css, {
            from: inputCSS,
            to: outputCSS
          })

          writeFileSync(outputCSS, result.css)

          console.log(`Successfully built CSS: ${outputCSS}`)
        }
      }
    ],
    build: {
      outDir: `dist/${browser}`,
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
