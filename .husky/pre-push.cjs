const { execSync } = require('child_process')

const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()

if (currentBranch === 'main') {
  console.error(
    'Direct pushes to main branch are not allowed. Please create a pull request instead.'
  )
  process.exit(1)
}
