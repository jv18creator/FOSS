import { test, expect } from '@playwright/test';

test.describe('Letterhead Studio', () => {
  test('loads editor with blank canvas', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('toolbar')).toBeVisible();
    await expect(page.getByTestId('letterhead-canvas')).toBeVisible();
    const counts = await page.evaluate(() => window.__letterheadEditor!.getCounts());
    expect(counts?.content).toBe(0);
  });

  test('switches page format and use mode', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Resize', exact: true }).click();
    await page.getByTestId('page-format').selectOption('us-letter');
    await expect(page.getByTestId('stage-format-label')).toContainText('US Letter');
    await page.getByTestId('mode-use').click();
    await expect(page.getByTestId('mode-use')).toHaveClass(/active/);
  });
});
