const { defineConfig } = require('cypress')
const { addMatchImageSnapshotPlugin } = require('@simonsmith/cypress-image-snapshot/plugin')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on)
    },
    baseUrl: 'https://next-staging.almosafer.com',
    // Force viewport settings - these MUST be respected
    viewportWidth: 1280,
    viewportHeight: 720,
    // Disable automatic failure screenshots to avoid test runner UI
    screenshotOnRunFailure: false,
    video: false,
    // Additional viewport enforcement
    chromeWebSecurity: false,
    // Force specific browser settings
    browser: 'electron',
    // Environment-specific overrides
    env: {
      jenkins: process.env.JENKINS_URL ? true : false
    },
    // Override any default viewport settings
    viewport: {
      width: 1280,
      height: 720
    },
    // Reporter configuration for visual tests
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true,
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: true
    }
  },
  // Global screenshot settings - ensure clean captures
  screenshot: {
    fullPage: true,
    capture: 'fullPage'
  },
  // Force Electron browser settings
  electron: {
    viewport: {
      width: 1280,
      height: 720
    }
  }
})