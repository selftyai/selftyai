import { scopedPreflightStyles, isolateInsideOfContainer } from 'tailwindcss-scoped-preflight'

module.exports = {
  important: '.context-menu',
  content: ['./src/components/ContextMenu/index.tsx'],
  theme: {
    extend: {}
  },
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer('.context-menu')
    })
  ]
}
