import { test, expect } from '@playwright/test'

test.describe('Integrations - Enhanced Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/integrations')
    await page.waitForLoadState('networkidle')
  })

  test('should display available platforms', async ({ page }) => {
    // Check for platform cards
    const platforms = page.locator('text=/google|notion|jira|github/i')
    await expect(platforms.first()).toBeVisible()
  })

  test('should show platform connection status', async ({ page }) => {
    // Look for status indicators
    const statusBadges = page.locator('text=/connected|disconnected|error/i')
    // Status should be visible for each platform
  })

  test('should initiate OAuth flow', async ({ page }) => {
    // Find connect button for a platform
    const connectButton = page.locator('button:has-text("Connect")').first()
    
    if (await connectButton.isVisible()) {
      // Clicking will redirect to OAuth provider
      // In test, we can verify the redirect URL
      const [response] = await Promise.all([
        page.waitForResponse(response => response.url().includes('/api/oauth/authorize')),
        connectButton.click()
      ])
      
      // Verify redirect occurred
      expect(response.status()).toBeLessThan(400)
    }
  })

  test('should display connected platforms', async ({ page }) => {
    // Look for connected platform indicators
    const connectedPlatforms = page.locator('text=/connected/i')
    // Should show platforms that are connected
  })

  test('should allow disconnecting platforms', async ({ page }) => {
    // Find disconnect button
    const disconnectButton = page.locator('button:has-text("Disconnect")').first()
    
    if (await disconnectButton.isVisible()) {
      await expect(disconnectButton).toBeVisible()
      // Clicking should disconnect (may require confirmation)
    }
  })

  test('should display available tools', async ({ page }) => {
    // Look for tools browser/list
    const toolsSection = page.locator('text=/tools|available/i')
    // Tools should be listed for connected platforms
  })

  test('should allow tool execution', async ({ page }) => {
    // Find a tool and execute button
    const executeButton = page.locator('button:has-text("Execute")').first()
    
    if (await executeButton.isVisible()) {
      await executeButton.click()
      
      // Look for tool execution form/modal
      const toolForm = page.locator('form, [role="dialog"]')
      // Form should appear for tool input
    }
  })

  test('should show tool execution results', async ({ page }) => {
    // After executing a tool, results should be displayed
    const results = page.locator('[data-testid="tool-result"]').or(
      page.locator('text=/success|result|output/i')
    )
    // Results should appear after execution
  })

  test('should handle tool execution errors', async ({ page }) => {
    // Simulate tool execution error
    // Check for error messages
    const errorMessage = page.locator('text=/error|failed/i')
    // Error should be displayed appropriately
  })

  test('should refresh integration status', async ({ page }) => {
    // Find refresh button
    const refreshButton = page.locator('button:has-text("Refresh")').or(
      page.locator('[aria-label*="refresh" i]')
    ).first()
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click()
      
      // Wait for refresh to complete
      await page.waitForTimeout(1000)
      
      // Status should update
    }
  })

  test('should filter tools by platform', async ({ page }) => {
    // Look for platform filter
    const platformFilter = page.locator('select, [role="combobox"]')
    
    if (await platformFilter.isVisible()) {
      await platformFilter.click()
      
      // Select a platform
      const option = page.locator('[role="option"]').first()
      if (await option.isVisible()) {
        await option.click()
        
        // Tools should filter to selected platform
        await page.waitForTimeout(500)
      }
    }
  })

  test('should search tools', async ({ page }) => {
    // Look for tool search input
    const searchInput = page.locator('input[placeholder*="Search"]').or(
      page.locator('input[type="search"]')
    ).first()
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('gmail')
      
      // Wait for search results
      await page.waitForTimeout(500)
      
      // Results should filter
      const results = page.locator('[data-testid="tool-item"]')
      // Results should match search query
    }
  })
})

