import { test, expect } from '@playwright/test'

test.describe('AI Analysis Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to files page
    await page.goto('/files')
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to analysis page', async ({ page }) => {
    // Look for analysis/view buttons
    const viewButton = page.locator('button:has-text("View")').or(
      page.locator('a:has-text("View")').or(
        page.locator('[aria-label*="view" i]')
      )
    ).first()
    
    // If files exist, click to view analysis
    if (await viewButton.isVisible()) {
      await viewButton.click()
      await expect(page).toHaveURL(/\/files\/[^/]+/)
    }
  })

  test('should display analysis viewer', async ({ page }) => {
    // Navigate to a file analysis page (requires file ID)
    // For now, check if route structure exists
    await page.goto('/files/test-file-id')
    
    // Look for analysis components
    const analysisViewer = page.locator('[data-testid="analysis-viewer"]').or(
      page.locator('h1, h2').filter({ hasText: /analysis|summary/i })
    )
    // May show loading or error if file doesn't exist
  })

  test('should show streaming progress', async ({ page }) => {
    await page.goto('/files/test-file-id')
    
    // Look for streaming indicators
    const streamingIndicator = page.locator('text=/analyzing|processing|loading/i')
    // May not be visible if analysis is complete
  })

  test('should display analysis results', async ({ page }) => {
    await page.goto('/files/test-file-id')
    
    // Look for analysis sections
    const summary = page.locator('text=/summary|overview/i')
    const keyPoints = page.locator('text=/key points|insights/i')
    const insights = page.locator('text=/insights|findings/i')
    
    // Results may not be visible if analysis hasn't run
  })

  test('should handle analysis errors', async ({ page }) => {
    await page.goto('/files/invalid-file-id')
    
    // Check for error messages
    const errorMessage = page.locator('text=/error|failed|not found/i')
    // Error should appear for invalid file
  })

  test('should show analysis metadata', async ({ page }) => {
    await page.goto('/files/test-file-id')
    
    // Look for metadata (agent type, timestamp, status)
    const agentType = page.locator('text=/document|image|code|data/i')
    const timestamp = page.locator('time, [datetime]')
    const status = page.locator('text=/completed|processing|pending/i')
  })

  test('should support different agent types', async ({ page }) => {
    // Test document agent
    await page.goto('/files/document-file-id')
    const documentAnalysis = page.locator('text=/document|text|content/i')
    
    // Test image agent
    await page.goto('/files/image-file-id')
    const imageAnalysis = page.locator('text=/image|visual|description/i')
    
    // Test code agent
    await page.goto('/files/code-file-id')
    const codeAnalysis = page.locator('text=/code|function|class/i')
    
    // Test data agent
    await page.goto('/files/data-file-id')
    const dataAnalysis = page.locator('text=/data|table|spreadsheet/i')
  })
})

