const { defineConfig } = require('cypress')
const { addMatchImageSnapshotPlugin } = require('@simonsmith/cypress-image-snapshot/plugin')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on)
    },
    baseUrl: 'https://next-staging.almosafer.com',
    // Force viewport settings for Jenkins
    viewportWidth: 1280,
    viewportHeight: 720,
    screenshotOnRunFailure: true,
    video: true,
    // Force Electron browser
    browser: 'electron',
    // Override any default settings
    chromeWebSecurity: false,
    // Force viewport
    viewport: {
      width: 1280,
      height: 720
    },
    // Environment variables
    env: {
      jenkins: true,
      updateSnapshots: false
    }
  },
  // Global screenshot settings
  screenshot: {
    fullPage: true,
    capture: 'fullPage'
  },
  // Force Electron settings
  electron: {
    viewport: {
      width: 1280,
      height: 720
    }
  }
})
