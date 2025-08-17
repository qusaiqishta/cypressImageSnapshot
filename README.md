# Cypress Visual Image Testing

This project demonstrates visual regression testing using Cypress and the `@simonsmith/cypress-image-snapshot` plugin.

## Features

- Visual regression testing with Cypress
- Image snapshot comparison
- Automated screenshot capture
- Baseline image management

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Open Cypress in interactive mode:
   ```bash
   npm run test:open
   ```

4. Update snapshots (when baseline images change):
   ```bash
   npm run test:update-snapshots
   ```

## Test Structure

- **Test File**: `cypress/e2e/signin-page-snapshot.cy.js`
- **Baseline Images**: `cypress/snapshots/`
- **Configuration**: `cypress.config.js`

## Current Test

The project includes a test that:
1. Visits the Almosafer signin page
2. Takes a screenshot
3. Compares it against a baseline image

## Configuration

- **Failure Threshold**: 3% (0.03)
- **Viewport**: 1280x720
- **Base URL**: https://next-staging.almosafer.com

## Commands

- `npm test` - Run all tests
- `npm run test:open` - Open Cypress in interactive mode
- `npm run test:update-snapshots` - Update baseline images
- `npm run test:no-fail-on-diff` - Run tests without failing on image differences
