const { exec } = require('child_process');
const path = require('path');

// Function to open reports in browser
function openReports() {
  const reportsDir = path.join(__dirname, '../reports');
  
  // Find the latest Mochawesome report
  const fs = require('fs');
  const mochaFiles = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('mochawesome_') && file.endsWith('.html'))
    .sort()
    .reverse();
  
  const latestMochaReport = mochaFiles[0];
  const visualReport = 'visual-comparison-report.html';
  
  if (latestMochaReport) {
    const mochaPath = path.join(reportsDir, latestMochaReport);
    const visualPath = path.join(reportsDir, visualReport);
    
    console.log('🌐 Opening reports in browser...');
    
    // Open Mochawesome report
    exec(`open "${mochaPath}"`, (error) => {
      if (error) {
        console.log('⚠️ Could not open Mochawesome report:', error.message);
      } else {
        console.log('✅ Mochawesome report opened');
      }
    });
    
    // Open Visual report
    exec(`open "${visualPath}"`, (error) => {
      if (error) {
        console.log('⚠️ Could not open Visual report:', error.message);
      } else {
        console.log('✅ Visual report opened');
      }
    });
    
  } else {
    console.log('⚠️ No Mochawesome reports found');
  }
}

// Export the function
module.exports = { openReports };

// Run if called directly
if (require.main === module) {
  openReports();
}
