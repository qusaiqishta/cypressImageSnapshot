describe('Signin Page Visual Test', () => {
    before(()=>{
        cy.intercept('GET', 'https://bat.bing.com/bat.js', { statusCode: 204 });
        cy.intercept('GET', 'https://connect.facebook.net/en_US/fbevents.js', { statusCode: 204 });
        cy.intercept('GET', 'https://s.yimg.com/wi/ytc.js', { statusCode: 204 });
        cy.intercept('GET', 'https://analytics.tiktok.com/i18n/pixel/events.js*', { statusCode: 204 });
        cy.intercept('GET', 'https://wa.onelink.me/v1/onelink', { statusCode: 204 });
        cy.intercept('GET', 'https://banner.appsflyer.com/sb/**', { statusCode: 204 });
        cy.intercept('GET', 'https://www.googletagmanager.com/gtm.js*', { statusCode: 204 });
        cy.intercept('GET', 'https://www.google.com/recaptcha/enterprise/webworker.js*', { statusCode: 204 });
        cy.intercept('GET', 'https://www.google.com/recaptcha/enterprise/pat*', { statusCode: 204 });
        cy.intercept('POST', 'https://www.google.com/recaptcha/enterprise/pat*', { statusCode: 204 });
        cy.intercept('GET', 'https://td.doubleclick.net/td/rul/**', { statusCode: 204 });
        cy.intercept('POST', 'https://wa.appsflyer.com/events*', { statusCode: 204 });
    })
  it('should match the signin page snapshot', () => {
    // Set viewport explicitly for consistency
    cy.viewport(1280, 720)
    
    // Visit the signin page
    cy.visit('/en/signin?ncr=1')
    
    // Wait for the page to load completely
    cy.wait(2000)
    
    // Wait for the page to be fully loaded and stable
    cy.get('body').should('be.visible')
    
    // Wait for any dynamic content to load (like footer)
    cy.wait(1000)
    
    // Scroll to bottom to ensure footer is loaded
    cy.scrollTo('bottom', { duration: 1000 })
    
    // Wait a bit more for any lazy-loaded content
    cy.wait(500)
    
    // Scroll back to top
    cy.scrollTo('top', { duration: 500 })
    
    // Take a full page snapshot and compare with baseline
    cy.matchImageSnapshot('signin-page', {
      fullPage: true,
      capture: 'fullPage'
    })
  })
})
