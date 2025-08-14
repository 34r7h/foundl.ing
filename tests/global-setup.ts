import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Setup test environment
  await page.goto('http://localhost:3000/health');
  
  // Wait for services to be ready
  await page.waitForTimeout(5000);
  
  await browser.close();
}

export default globalSetup;
