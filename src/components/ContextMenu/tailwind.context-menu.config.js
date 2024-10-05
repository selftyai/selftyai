import { scopedPreflightStyles, isolateInsideOfContainer } from 'tailwindcss-scoped-preflight'

const { nextui } = require('@nextui-org/react')

module.exports = {
  content: [
    './src/components/ContextMenu/index.tsx',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  darkMode: 'class',
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer('.context-menu')
    }),
    nextui()
  ]
}
