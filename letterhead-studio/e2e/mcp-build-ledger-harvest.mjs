/** Playwright MCP snippet: build Ledger Harvest template via editor UI */
export default async (page) => {
  const mm = (n) => Math.round((n / 25.4) * 96);
  const tool = (name) => page.getByRole('button', { name, exact: true }).click();
  const pick = (i) =>
    page.evaluate((idx) => window.__letterheadEditor.selectContentIndex(idx), i);
  const xf = (patch) =>
    page.evaluate((p) => window.__letterheadEditor.transformActive(p), patch);
  const text = async (value) => {
    await tool('Layers');
    await page.getByTestId('sel-text').fill(value);
  };
  const lock = async () => {
    await tool('Layers');
    await page.getByTestId('sel-locked').check();
  };

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForFunction(() => window.__letterheadEditor?.getCounts() != null);

  await tool('Templates');
  await page.getByTestId('template-name').fill('Ledger Harvest');
  await tool('Resize');
  await page.getByTestId('page-format').selectOption('executive');
  await page.getByTestId('orientation-portrait').click();
  await tool('Background');
  await page.getByRole('button', { name: 'Mint', exact: true }).click();

  await tool('Text');
  await page.getByTestId('add-heading').click();
  await pick(0);
  await xf({
    left: mm(12),
    top: mm(12),
    fill: '#1a2e1a',
    fontFamily: 'Oswald, system-ui, sans-serif',
    fontSize: 26,
  });
  await text('LEDGER HARVEST CO-OP');

  await tool('Text');
  await page.getByRole('button', { name: 'Create sub-header', exact: true }).click();
  await pick(1);
  await xf({
    left: mm(12),
    top: mm(20),
    fill: '#3f6212',
    fontFamily: 'Merriweather, Georgia, serif',
    fontSize: 10,
  });
  await text('Soil-to-table since 2011');

  await tool('Elements');
  await page.getByTestId('add-line').click();
  await pick(2);
  await xf({
    line: { x1: mm(12), y1: mm(26), x2: mm(172), y2: mm(26) },
    stroke: '#d97706',
    strokeWidth: 2,
  });
  await lock();

  await tool('Text');
  await page.getByRole('button', { name: '"Create with purpose"', exact: true }).click();
  await pick(3);
  await xf({
    left: mm(12),
    top: mm(30),
    fill: '#1a2e1a',
    fontFamily: 'Merriweather, Georgia, serif',
    fontSize: 13,
    opacity: 0.92,
  });
  await text('"Shared tables, shared seasons."');

  await tool('Text');
  await page.getByTestId('add-body').click();
  await pick(4);
  await xf({
    left: mm(12),
    top: mm(42),
    fill: '#365314',
    fontFamily: 'Merriweather, Georgia, serif',
    fontSize: 10,
  });
  await text(
    'Route 9 Market Barn  ·  Hudson, NY 12534\n(518) 555-0140  ·  hello@ledgerharvest.coop',
  );

  return await page.evaluate(() => window.__letterheadEditor.exportPayload());
}
