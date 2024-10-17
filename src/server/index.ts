import BackgroundService from '@/server/services/BackgroundService'

const backgroundService = new BackgroundService()
backgroundService.start()

// Listen for extension unload to stop the service
chrome.runtime.onSuspend.addListener(backgroundService.stop)
