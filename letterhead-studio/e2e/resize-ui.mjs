/** @typedef {import('@playwright/test').Page} Page */

const FORMAT_PRINT_PRESETS = {
  a4: 'A4 Portrait',
  'us-letter': 'Letter Portrait',
};

const FORMAT_MM = {
  a4: [210, 297],
  'us-letter': [215.9, 279.4],
  legal: [215.9, 355.6],
  executive: [184.15, 266.7],
};

/**
 * @param {Page} page
 * @param {string} formatId
 */
export async function setPageFormat(page, formatId) {
  await page.getByRole('button', { name: 'Resize', exact: true }).click();
  const preset = FORMAT_PRINT_PRESETS[formatId];
  if (preset) {
    await page.getByRole('button', { name: preset, exact: true }).click();
    return;
  }
  const dims = FORMAT_MM[formatId];
  if (!dims) throw new Error(`Unknown format: ${formatId}`);
  const [wMm, hMm] = dims;
  await page.getByTestId('resize-units').selectOption('cm');
  await page.getByTestId('resize-width').fill(String(Math.round((wMm / 10) * 100) / 100));
  await page.getByTestId('resize-height').fill(String(Math.round((hMm / 10) * 100) / 100));
  await page.getByTestId('resize-apply').click();
}
