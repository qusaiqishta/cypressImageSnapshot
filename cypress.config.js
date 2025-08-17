const { defineConfig } = require('cypress')
const { addMatchImageSnapshotPlugin } = require('@simonsmith/cypress-image-snapshot/plugin')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on)
    },
    baseUrl: 'https://next-staging.almosafer.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    screenshotOnRunFailure: true,
    video: true,
    // Ensure consistent viewport across environments
    chromeWebSecurity: false,
    // Force viewport size
    viewport: {
      width: 1280,
      height: 720
    },
    // Additional viewport settings for consistency
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    // Environment-specific overrides
    env: {
      // Jenkins-specific settings
      jenkins: process.env.JENKINS_URL ? true : false
    }
  },
  // Global screenshot settings
  screenshot: {
    // Ensure consistent screenshot behavior
    fullPage: true,
    capture: 'fullPage'
  }
})