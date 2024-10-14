import fs from 'fs'

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

const commonManifest = {
  manifest_version: 3,
  version: packageJson.version,
  name: '__MSG_extensionName__',
  description: '__MSG_extensionDescription__',
  default_locale: 'en',
  icons: {
    '16': '/icons/icon16.png',
    '32': '/icons/icon32.png',
    '48': '/icons/icon48.png',
    '128': '/icons/icon128.png'
  },
  background: {
    service_worker: 'background.js',
    type: 'module'
  },
  content_scripts: [
    {
      matches: ['https://*/*', 'http://*/*'],
      js: ['contentScript.js']
    }
  ],
  permissions: ['sidePanel', 'storage', 'unlimitedStorage'],
  host_permissions: ['<all_urls>'],
  web_accessible_resources: [
    {
      resources: ['icons/*'],
      matches: ['<all_urls>']
    }
  ]
}

const createManifest = (browser: string) => {
  const extendManifests = {
    chrome: {
      side_panel: {
        default_path: 'index.html'
      }
    },
    opera: {
      sidebar_action: {
        default_icon: '/icons/icon32.png',
        default_title: '__MSG_extensionName__',
        default_panel: 'index.html'
      }
    }
  }

  return {
    ...commonManifest,
    ...extendManifests[browser as 'chrome' | 'opera']
  }
}

export default createManifest