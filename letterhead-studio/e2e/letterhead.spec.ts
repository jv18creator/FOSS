import { test, expect } from '@playwright/test';
import { gotoEditor, setPageFormat, setEditorMode, studioTool } from './helpers';

test.describe('Letterhead Studio', () => {
  test('loads editor with blank canvas', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('toolbar')).toBeVisible();
    await expect(page.getByTestId('letterhead-canvas')).toBeVisible();
    const counts = await page.evaluate(() => window.__letterheadEditor!.getCounts());
    expect(counts?.content).toBe(0);
  });

  test('switches page format and use mode', async ({ page }) => {
    await gotoEditor(page);
    await setPageFormat(page, 'us-letter');
    await expect(page.getByTestId('stage-format-label')).toContainText('US Letter');
    await setEditorMode(page, 'use');
    await studioTool(page, 'Text');
    await page.getByTestId('add-heading').click();
    await expect(page.getByTestId('delete-selected')).toHaveCount(0);
  });
});
