import remToPx from 'tailwindcss-rem-to-px'
import { scopedPreflightStyles, isolateInsideOfContainer } from 'tailwindcss-scoped-preflight'

const { nextui } = require('@nextui-org/react')

module.exports = {
  content: [
    './src/pageContent/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  darkMode: 'class',
  plugins: [
    remToPx(),
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer('.selftyai-overlay')
    }),
    nextui()
  ]
}
