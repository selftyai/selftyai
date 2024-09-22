import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'

  return {
    plugins: [react()],
    root: isDevelopment ? './pages' : undefined,
    base: isDevelopment ? '/' : './',
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          background: resolve(__dirname, 'src/background.ts'),
          contentScript: resolve(__dirname, 'src/contentScript.ts')
        },
        output: {
          entryFileNames: (chunkInfo) => {
            const options = {
              background: true,
              contentScript: true
            } as Record<string, boolean>

            return options[chunkInfo.name] ? '[name].js' : '[name]/[name].js'
          },
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
