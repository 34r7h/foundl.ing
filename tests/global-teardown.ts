import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Cleanup test environment
  console.log('🧹 Cleaning up test environment...');
  
  // Add any cleanup logic here
  // - Close database connections
  // - Clean up test data
  // - Stop background services
}

export default globalTeardown;
