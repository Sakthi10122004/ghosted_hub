const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  try {
    await page.goto('http://localhost:3000/dashboard/projects', { waitUntil: 'networkidle0' });
    
    // Login
    await page.type('input[type="email"]', 'superadmin@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Find the first Workspace button
    const workspaceLinks = await page.$$('a[href^="/dashboard/projects/"]');
    if (workspaceLinks.length > 0) {
      console.log('Clicking Workspace button...');
      await workspaceLinks[0].click();
      await page.waitForTimeout(3000); // wait for chat room to load and potentially crash
    } else {
      console.log('No project workspaces found. Please create a project first.');
    }
    
  } catch (err) {
    console.error('SCRIPT ERROR:', err);
  } finally {
    await browser.close();
  }
})();
