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
    video: false,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true
    }
  },
})