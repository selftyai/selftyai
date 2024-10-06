import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode.includes('development')
  const isChrome = mode.includes('chrome')

  return {
    plugins: [
      react(),
      {
        name: 'prebuild-commands',
        buildStart: async () => {
          buildProject()
        },
        handleHotUpdate: async () => {
          buildProject()
        }
      }
    ],
    build: {
      minify: isDevelopment ? false : 'esbuild',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
          background: resolve(__dirname, `src/server/${isChrome ? 'chrome' : ''}/index.ts`)
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

// func for build css for context menu and content script
function buildProject() {
  try {
    console.log('Building contentScript...')
    execSync('vite build --config vite.contentScript-config.ts --mode development', {
      stdio: 'inherit'
    })
    console.log('ContentScript build completed.')
  } catch (error) {
    console.error('Error during ContentScript build:', error)
  }

  try {
    console.log('Building Tailwind CSS...')
    execSync(
      'tailwindcss -c ./src/components/PageOverlay/tailwind.page-overlay.config.js -i ./src/index.css -o ./dist/assets/output.css --minify',
      { stdio: 'inherit' }
    )
    console.log('Tailwind CSS build completed.')
  } catch (error) {
    console.error('Error during Tailwind CSS build:', error)
  }
}
