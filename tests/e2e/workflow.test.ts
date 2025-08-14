import { test, expect } from '@playwright/test';

test.describe('Foundling End-to-End Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
  });

  test.describe('User Authentication', () => {
    test('User registration and login flow', async ({ page }) => {
      // 1. Click register button
      await page.click('text=Register');
      
      // 2. Fill registration form
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.fill('[data-testid="confirm-password"]', 'password123');
      await page.fill('[data-testid="name"]', 'Test User');
      await page.selectOption('[data-testid="user-type"]', 'innovator');
      
      // 3. Submit registration
      await page.click('[data-testid="register-submit"]');
      
      // 4. Verify successful registration
      await expect(page.locator('text=Registration successful')).toBeVisible();
      
      // 5. Login with new account
      await page.click('text=Login');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      
      // 6. Verify successful login
      await expect(page.locator('text=Welcome, Test User')).toBeVisible();
    });

    test('User logout flow', async ({ page }) => {
      // 1. Login first
      await page.click('text=Login');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      
      // 2. Click logout
      await page.click('[data-testid="logout"]');
      
      // 3. Verify logout
      await expect(page.locator('text=Login')).toBeVisible();
    });
  });

  test.describe('Idea Submission and Management', () => {
    test('Submit a new idea', async ({ page }) => {
      // 1. Login first
      await page.click('text=Login');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      
      // 2. Navigate to idea submission
      await page.click('text=Submit Idea');
      
      // 3. Fill idea form
      await page.fill('[data-testid="idea-title"]', 'Test Innovation Idea');
      await page.fill('[data-testid="idea-description"]', 'A revolutionary idea for testing purposes');
      await page.selectOption('[data-testid="idea-category"]', 'Technology');
      await page.fill('[data-testid="idea-market-size"]', '1000000');
      await page.fill('[data-testid="idea-skills"]', 'Solidity,Vue.js,AI/ML');
      await page.fill('[data-testid="idea-equity"]', '5');
      await page.fill('[data-testid="idea-metadata"]', 'ipfs://test-metadata');
      
      // 4. Submit idea
      await page.click('[data-testid="submit-idea"]');
      
      // 5. Verify submission
      await expect(page.locator('text=Idea submitted successfully')).toBeVisible();
    });

    test('Browse and filter ideas', async ({ page }) => {
      // 1. Navigate to marketplace
      await page.click('text=Marketplace');
      
      // 2. Verify marketplace loads
      await expect(page.locator('text=Browse Ideas')).toBeVisible();
      
      // 3. Filter by category
      await page.selectOption('[data-testid="category-filter"]', 'Technology');
      await page.click('[data-testid="apply-filters"]');
      
      // 4. Verify filtered results
      await expect(page.locator('[data-testid="idea-card"]')).toBeVisible();
    });
  });

  test.describe('Project Creation and Management', () => {
    test('Create a new project from idea', async ({ page }) => {
      // 1. Login first
      await page.click('text=Login');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      
      // 2. Navigate to marketplace and select idea
      await page.click('text=Marketplace');
      await page.click('[data-testid="idea-card"]');
      
      // 3. Click create project
      await page.click('[data-testid="create-project"]');
      
      // 4. Fill project form
      await page.fill('[data-testid="project-title"]', 'Test Project');
      await page.fill('[data-testid="project-description"]', 'A test project for the idea');
      await page.fill('[data-testid="project-budget"]', '10000');
      await page.fill('[data-testid="project-timeline"]', '90');
      
      // 5. Add milestones
      await page.fill('[data-testid="milestone-0-title"]', 'Design & Architecture');
      await page.fill('[data-testid="milestone-0-budget"]', '3000');
      await page.fill('[data-testid="milestone-1-title"]', 'Development');
      await page.fill('[data-testid="milestone-1-budget"]', '5000');
      await page.fill('[data-testid="milestone-2-title"]', 'Testing');
      await page.fill('[data-testid="milestone-2-budget"]', '2000');
      
      // 6. Submit project
      await page.click('[data-testid="submit-project"]');
      
      // 7. Verify project creation
      await expect(page.locator('text=Project created successfully')).toBeVisible();
    });

    test('Complete project milestone', async ({ page }) => {
      // 1. Login first
      await page.click('text=Login');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      
      // 2. Navigate to projects
      await page.click('text=Projects');
      await page.click('[data-testid="project-card"]');
      
      // 3. Complete first milestone
      await page.click('[data-testid="complete-milestone-0"]');
      
      // 4. Add completion details
      await page.fill('[data-testid="milestone-notes"]', 'Design and architecture completed successfully');
      
      // 5. Submit milestone completion
      await page.click('[data-testid="submit-milestone"]');
      
      // 6. Verify milestone was completed
      await expect(page.locator('text=Milestone completed successfully')).toBeVisible();
      await expect(page.locator('text=Design & Architecture: Completed')).toBeVisible();
      
      // 7. Check payment status
      await page.click('[data-testid="payments-tab"]');
      await expect(page.locator('text=Payment Released: $5,000')).toBeVisible();
    });
  });

  test.describe('AI Agent Integration', () => {
    test('Idea validation using AI agents', async ({ page }) => {
      // 1. Create a new idea
      await page.click('text=Submit Idea');
      await page.fill('[data-testid="idea-title"]', 'Test AI Idea');
      await page.fill('[data-testid="idea-description"]', 'A test idea for AI validation');
      await page.selectOption('[data-testid="idea-category"]', 'Technology');
      await page.fill('[data-testid="idea-market-size"]', '1000000');
      await page.fill('[data-testid="idea-skills"]', 'Python,AI/ML');
      await page.fill('[data-testid="idea-equity"]', '3');
      
      // 2. Submit for AI validation
      await page.click('[data-testid="ai-validate"]');
      
      // 3. Wait for AI analysis
      await page.waitForSelector('[data-testid="ai-analysis-complete"]', { timeout: 30000 });
      
      // 4. Verify AI recommendations
      await expect(page.locator('[data-testid="ai-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-recommendations"]')).toBeVisible();
      
      // 5. Submit idea with AI feedback
      await page.click('[data-testid="submit-idea"]');
      await expect(page.locator('text=Idea submitted successfully')).toBeVisible();
    });

    test('Builder matching using AI agents', async ({ page }) => {
      // 1. Navigate to marketplace
      await page.click('text=Marketplace');
      
      // 2. Select an idea
      await page.click('[data-testid="idea-card"]');
      
      // 3. Use AI builder matching
      await page.click('[data-testid="ai-match-builders"]');
      
      // 4. Wait for AI matching
      await page.waitForSelector('[data-testid="ai-matching-complete"]', { timeout: 30000 });
      
      // 5. Verify AI recommendations
      await expect(page.locator('[data-testid="builder-recommendations"]')).toBeVisible();
      await expect(page.locator('[data-testid="compatibility-scores"]')).toBeVisible();
    });

    test('Market analysis using AI agents', async ({ page }) => {
      // 1. Navigate to tools
      await page.click('text=Tools');
      
      // 2. Select market analysis
      await page.click('[data-testid="market-analysis"]');
      
      // 3. Enter market parameters
      await page.fill('[data-testid="market-sector"]', 'Technology');
      await page.fill('[data-testid="market-region"]', 'Global');
      await page.selectOption('[data-testid="market-timeframe"]', '12-months');
      
      // 4. Run AI analysis
      await page.click('[data-testid="run-analysis"]');
      
      // 5. Wait for analysis completion
      await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 30000 });
      
      // 6. Verify analysis results
      await expect(page.locator('[data-testid="market-size"]')).toBeVisible();
      await expect(page.locator('[data-testid="growth-rate"]')).toBeVisible();
      await expect(page.locator('[data-testid="key-trends"]')).toBeVisible();
    });
  });

  test.describe('Smart Contract Integration', () => {
    test('NFT minting for idea ownership', async ({ page }) => {
      // 1. Navigate to idea details
      await page.click('text=Marketplace');
      await page.click('[data-testid="idea-card"]');
      
      // 2. Mint idea NFT
      await page.click('[data-testid="mint-nft"]');
      
      // 3. Connect wallet
      await page.click('[data-testid="connect-wallet"]');
      
      // 4. Verify NFT minting
      await expect(page.locator('text=NFT minted successfully')).toBeVisible();
    });

    test('USDC funding and payments', async ({ page }) => {
      // 1. Navigate to project funding
      await page.click('text=Projects');
      await page.click('[data-testid="project-card"]');
      await page.click('[data-testid="fund-project"]');
      
      // 2. Enter funding amount
      await page.fill('[data-testid="funding-amount"]', '5000');
      await page.click('[data-testid="approve-funding"]');
      
      // 3. Verify funding success
      await expect(page.locator('text=Funding successful')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('Handle network errors gracefully', async ({ page }) => {
      // 1. Simulate network error
      await page.route('**/api/**', route => route.abort('failed'));
      
      // 2. Try to submit idea
      await page.click('text=Submit Idea');
      await page.fill('[data-testid="idea-title"]', 'Test Idea');
      await page.click('[data-testid="submit-idea"]');
      
      // 3. Verify error handling
      await expect(page.locator('text=Network error occurred')).toBeVisible();
      await expect(page.locator('text=Please try again')).toBeVisible();
    });

    test('Handle validation errors', async ({ page }) => {
      // 1. Try to submit invalid idea
      await page.click('text=Submit Idea');
      await page.click('[data-testid="submit-idea"]');
      
      // 2. Verify validation errors
      await expect(page.locator('text=Title is required')).toBeVisible();
      await expect(page.locator('text=Description is required')).toBeVisible();
    });

    test('Handle insufficient funds', async ({ page }) => {
      // 1. Navigate to project funding
      await page.click('text=Projects');
      await page.click('[data-testid="project-card"]');
      await page.click('[data-testid="fund-project"]');
      
      // 2. Try to fund with insufficient balance
      await page.fill('[data-testid="funding-amount"]', '999999999');
      await page.click('[data-testid="approve-funding"]');
      
      // 3. Verify error handling
      await expect(page.locator('text=Insufficient funds')).toBeVisible();
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('Handle multiple concurrent users', async ({ page, context }) => {
      // 1. Create multiple browser contexts
      const context2 = await context.browser()?.newContext();
      const context3 = await context.browser()?.newContext();
      
      if (!context2 || !context3) {
        throw new Error('Failed to create browser contexts');
      }
      
      const page2 = await context2.newPage();
      const page3 = await context3.newPage();
      
      // 2. Navigate all pages to the app
      await Promise.all([
        page.goto('http://localhost:5173'),
        page2.goto('http://localhost:5173'),
        page3.goto('http://localhost:5173')
      ]);
      
      // 3. Perform concurrent actions
      await Promise.all([
        page.click('text=Submit Idea'),
        page2.click('text=Marketplace'),
        page3.click('text=Tools')
      ]);
      
      // 4. Verify all pages loaded correctly
      await expect(page.locator('text=Submit Your Idea')).toBeVisible();
      await expect(page2.locator('text=Browse Ideas')).toBeVisible();
      await expect(page3.locator('text=AI Tools')).toBeVisible();
      
      // 5. Clean up
      await context2.close();
      await context3.close();
    });

    test('Handle large data sets', async ({ page }) => {
      // 1. Navigate to marketplace
      await page.click('text=Marketplace');
      
      // 2. Simulate large number of ideas
      await page.evaluate(() => {
        // Mock large dataset
        (window as any).testLargeDataset = true;
      });
      
      // 3. Verify pagination works
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      await expect(page.locator('[data-testid="next-page"]')).toBeVisible();
      
      // 4. Test search functionality
      await page.fill('[data-testid="search-ideas"]', 'AI');
      await page.click('[data-testid="search-button"]');
      
      // 5. Verify search results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });
  });
});
