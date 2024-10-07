import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode.includes('development')
  const isChrome = mode.includes('chrome')

  return {
    plugins: [react()],
    build: {
      minify: isDevelopment ? false : 'esbuild',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
          background: resolve(__dirname, `src/server/${isChrome ? 'chrome' : ''}/index.ts`),
          contentScript: resolve(__dirname, 'src/pageContent/contentScript.ts')
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
})
