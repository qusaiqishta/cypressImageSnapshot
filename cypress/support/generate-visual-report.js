const fs = require('fs');
const path = require('path');

// Function to clean up reports directory
function cleanupReportsDirectory(reportsDir) {
  try {
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      
      files.forEach(file => {
        const filePath = path.join(reportsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Removed: ${file}`);
        } else if (stats.isDirectory()) {
          // Remove directory contents recursively
          fs.rmSync(filePath, { recursive: true, force: true });
          console.log(`🗑️ Removed directory: ${file}`);
        }
      });
      
      console.log('✅ Reports directory cleaned up');
    }
  } catch (error) {
    console.log('⚠️ Warning: Could not clean up reports directory:', error.message);
  }
}

// Function to get error details from the error file
function getErrorDetails(reportsDir) {
  try {
    const errorFile = path.join(reportsDir, 'visual-test-error.json');
    if (fs.existsSync(errorFile)) {
      const errorData = JSON.parse(fs.readFileSync(errorFile, 'utf8'));
      return errorData;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Function to scan for test results and generate visual report
function generateVisualReport() {
  const reportsDir = path.join(__dirname, '../reports');
  const snapshotsDir = path.join(__dirname, '../snapshots');
  const screenshotsDir = path.join(__dirname, '../screenshots');
  
  // Clean up reports directory before generating new reports
  cleanupReportsDirectory(reportsDir);
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Scan for test results
  const testResults = scanTestResults(snapshotsDir, screenshotsDir, reportsDir);
  
  if (testResults.length === 0) {
    console.log('⚠️ No visual test results found. Make sure to run the tests first.');
    return;
  }
  
  // Generate HTML report with visual comparisons
  const htmlContent = generateHTMLReport(testResults, reportsDir);
  
  // Write the HTML report
  const reportPath = path.join(reportsDir, 'visual-comparison-report.html');
  fs.writeFileSync(reportPath, htmlContent);
  
  console.log(`✅ Visual comparison report generated: ${reportPath}`);
  console.log(`📊 Found ${testResults.length} test result(s)`);
}

// Function to scan for test results
function scanTestResults(snapshotsDir, screenshotsDir, reportsDir) {
  const results = [];
  
  if (!fs.existsSync(snapshotsDir)) {
    console.log('⚠️ Snapshots directory not found');
    return results;
  }
  
  // Scan snapshots directory
  const snapshotTests = fs.readdirSync(snapshotsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  snapshotTests.forEach(testName => {
    const testSnapshotDir = path.join(snapshotsDir, testName);
    const testScreenshotsDir = path.join(screenshotsDir, testName);
    
    // Look for snapshot files
    const snapshotFiles = fs.readdirSync(testSnapshotDir)
      .filter(file => file.endsWith('.snap.png') || file.endsWith('.snap.jpg'));
    
    snapshotFiles.forEach(snapshotFile => {
      const snapshotName = path.parse(snapshotFile).name;
      const baselinePath = path.join(testSnapshotDir, snapshotFile);
      
      // Look for current screenshots
      let currentScreenshot = null;
      let diffImage = null;
      
      // Look for current screenshots in the screenshots directory
      if (fs.existsSync(testScreenshotsDir)) {
        const screenshotFiles = fs.readdirSync(testScreenshotsDir);
        
        // Look for current screenshots - prioritize the ones we capture with cy.screenshot()
        currentScreenshot = screenshotFiles.find(file => 
          (file.endsWith('.png') || file.endsWith('.jpg')) &&
          (file.includes(snapshotName) || 
           file.includes('current-') ||
           file.includes('failed') || 
           file.includes('Signin Page Visual Test'))
        );
      }
      
      // If no current screenshot found, indicate clean visual testing
      if (!currentScreenshot) {
        currentScreenshot = 'clean-visual-testing';
      }
      
      // Look for diff images
      const diffDir = path.join(testSnapshotDir, '__diff_output__');
      if (fs.existsSync(diffDir)) {
        const diffFiles = fs.readdirSync(diffDir);
        
        // More flexible matching for diff images
        diffImage = diffFiles.find(file => 
          (file.endsWith('.png') || file.endsWith('.jpg')) &&
          (file.includes(snapshotName) || 
           file.includes('diff') ||
           file.includes(snapshotName.split('.')[0])) // Try without .snap extension
        );
      }
      
      // Determine test status
      const hasDiff = diffImage !== null;
      const status = hasDiff ? 'fail' : 'pass';
      
      const result = {
        testName,
        snapshotName,
        baselinePath: path.relative(reportsDir, baselinePath),
        currentScreenshot: currentScreenshot && currentScreenshot !== 'clean-visual-testing' ? 
          path.relative(reportsDir, path.join(testScreenshotsDir, currentScreenshot)) : 
          currentScreenshot,
        diffImage: diffImage ? path.relative(reportsDir, path.join(diffDir, diffImage)) : null,
        status,
        hasDiff
      };
      
      results.push(result);
    });
  });
  
  return results;
}

// Function to generate HTML report
function generateHTMLReport(testResults, reportsDir) {
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const failedTests = testResults.filter(r => r.status === 'fail').length;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cypress Visual Test Comparison Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #2c3e50;
        }
        .summary-card .number {
            font-size: 2em;
            font-weight: bold;
        }
        .summary-card.total .number { color: #3498db; }
        .summary-card.passed .number { color: #27ae60; }
        .summary-card.failed .number { color: #e74c3c; }
        .test-section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #fafafa;
        }
        .test-title {
            font-size: 1.3em;
            color: #2c3e50;
            margin-bottom: 15px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .status {
            padding: 6px 12px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        .status.pass { background: #d5f4e6; color: #27ae60; }
        .status.fail { background: #fadbd8; color: #e74c3c; }
        .comparison-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .image-container {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .image-container h4 {
            margin: 0 0 15px 0;
            color: #34495e;
            font-size: 1em;
        }
        .image-container img {
            max-width: 100%;
            height: auto;
            border: 2px solid #ddd;
            border-radius: 5px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .image-container img:hover {
            transform: scale(1.05);
        }
        .baseline { border-color: #27ae60 !important; }
        .current { border-color: #e74c3c !important; }
        .diff { border-color: #f39c12 !important; }
        .no-image {
            padding: 40px 20px;
            color: #7f8c8d;
            font-style: italic;
            background: #ecf0f1;
            border-radius: 5px;
        }
        .metadata {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .metadata h4 {
            margin: 0 0 10px 0;
            color: #2c3e50;
        }
        .metadata p {
            margin: 5px 0;
            color: #34495e;
        }
        .timestamp {
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
        }
        .modal-content {
            margin: auto;
            display: block;
            max-width: 90%;
            max-height: 90%;
            margin-top: 5%;
        }
        .close {
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Cypress Visual Test Comparison Report</h1>
        </div>
        
        <div class="summary">
            <div class="summary-card total">
                <h3>Total Tests</h3>
                <div class="number">${totalTests}</div>
            </div>
            <div class="summary-card passed">
                <h3>Passed</h3>
                <div class="number">${passedTests}</div>
            </div>
            <div class="summary-card failed">
                <h3>Failed</h3>
                <div class="number">${failedTests}</div>
            </div>
        </div>
        
        ${testResults.map((result, index) => {
          // Get error details for failed tests
          const errorDetails = result.status === 'fail' ? getErrorDetails(reportsDir) : null;
          let failureReason = 'Visual differences detected between baseline and current screenshots';
          
          if (errorDetails && errorDetails.errorMessage) {
            // Extract the text before the dot (period) as requested
            const errorMessage = errorDetails.errorMessage;
            const dotIndex = errorMessage.indexOf('.');
            failureReason = dotIndex > 0 ? errorMessage.substring(0, dotIndex) : errorMessage;
          }

          return `
        <div class="test-section">
            <div class="test-title">
                <span class="status ${result.status}">
                    ${result.status === 'pass' ? '✅' : '❌'} ${result.status.toUpperCase()}
                </span>
                ${result.testName} - ${result.snapshotName}
            </div>
            
            ${result.status === 'fail' ? `
            <div class="metadata">
                <h4>ℹ️ Visual Testing Note:</h4>
                <p><strong>Current Status:</strong> The test detected visual differences between your baseline and current application state.</p>
                <p><strong>Failure Reason:</strong> ${failureReason}</p>
            </div>
            ` : ''}
            
            <div class="comparison-grid">
                <div class="image-container">
                    <h4>📸 Baseline Screenshot</h4>
                    ${result.baselinePath ? 
                        `<img src="${result.baselinePath}" alt="Baseline Screenshot" class="baseline" onclick="openModal(this.src)">` :
                        `<div class="no-image">No baseline image found</div>`
                    }
                </div>
                
                <div class="image-container">
                    <h4>📱 Current Screenshot</h4>
                    ${result.currentScreenshot && result.currentScreenshot !== 'clean-visual-testing' ? 
                        `<img src="${result.currentScreenshot}" alt="Current Screenshot" class="current" onclick="openModal(this.src)">` :
                        `<div class="no-image">Clean Visual Testing - No test runner UI captured</div>`
                    }
                </div>
                
                <div class="image-container">
                    <h4>🔍 Difference Highlighted</h4>
                    ${result.diffImage ? 
                        `<img src="${result.diffImage}" alt="Difference Image" class="diff" onclick="openModal(this.src)">` :
                        `<div class="no-image">${result.hasDiff ? 'Diff image not found' : 'No differences detected'}</div>`
                    }
                </div>
            </div>
        </div>
        `;
        }).join('')}
        
        <div class="timestamp">
            Report generated on: ${new Date().toLocaleString()}
        </div>
    </div>
    
    <!-- Modal for image preview -->
    <div id="imageModal" class="modal" onclick="closeModal()">
        <span class="close">&times;</span>
        <img class="modal-content" id="modalImage">
    </div>
    
    <script>
        function openModal(src) {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            modal.style.display = "block";
            modalImg.src = src;
        }
        
        function closeModal() {
            document.getElementById('imageModal').style.display = "none";
        }
        
        // Close modal when clicking the close button
        document.querySelector('.close').onclick = function() {
            closeModal();
        }
        
        // Close modal when pressing Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    </script>
</body>
</html>`;
}

// Export the function
module.exports = { generateVisualReport };

// Run if called directly
if (require.main === module) {
  generateVisualReport();
}
