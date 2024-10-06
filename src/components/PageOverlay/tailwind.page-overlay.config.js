import { scopedPreflightStyles, isolateInsideOfContainer } from 'tailwindcss-scoped-preflight'

const { nextui } = require('@nextui-org/react')

module.exports = {
  content: [
    './src/components/PageOverlay/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  darkMode: 'class',
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer('.selftyai-overlay')
    }),
    nextui()
  ]
}
