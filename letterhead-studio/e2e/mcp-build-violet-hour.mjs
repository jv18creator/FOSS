/** Playwright MCP snippet: build Violet Hour template via editor UI */
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
  await page.getByTestId('template-name').fill('Violet Hour');
  await tool('Resize');
  await page.getByTestId('page-format').selectOption('us-letter');
  await page.getByTestId('orientation-portrait').click();
  await tool('Background');
  await page.getByRole('button', { name: 'Lilac', exact: true }).click();

  await tool('Elements');
  await page.getByTestId('add-line').click();
  await pick(0);
  await xf({
    line: { x1: mm(80), y1: mm(18), x2: mm(203.9), y2: mm(18) },
    stroke: '#9d174d',
    strokeWidth: 1.25,
  });
  await lock();

  await tool('Text');
  await page.getByRole('button', { name: 'Timeless Elegance', exact: true }).click();
  await pick(1);
  await xf({
    left: mm(118),
    top: mm(10),
    fill: '#0a0a0a',
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: 34,
  });
  await text('Violet Hour');

  await tool('Text');
  await page.getByRole('button', { name: 'Create sub-header', exact: true }).click();
  await pick(2);
  await xf({
    left: mm(92),
    top: mm(22),
    fill: '#831843',
    fontFamily: 'Raleway, system-ui, sans-serif',
    fontSize: 10,
  });
  await text('PRIVATE EVENTS  ·  CHICAGO');

  await tool('Elements');
  await page.getByRole('button', { name: 'Hexagon', exact: true }).click();
  await pick(3);
  await xf({
    left: mm(14),
    top: mm(10),
    width: mm(14),
    height: mm(14),
    fill: '#9d174d',
    opacity: 0.18,
  });
  await lock();

  await tool('Text');
  await page.getByTestId('add-body').click();
  await pick(4);
  await xf({
    left: mm(14),
    top: mm(28),
    fill: '#44403c',
    fontFamily: 'Raleway, system-ui, sans-serif',
    fontSize: 10,
  });
  await text(
    '440 Lake Shore Drive  ·  Penthouse 18\nbookings@violethour.events  ·  (312) 555-0184',
  );

  return await page.evaluate(() => window.__letterheadEditor.exportPayload());
}
