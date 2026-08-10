/** Playwright MCP snippet: build Atelier Nord template via editor UI */
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
  await page.getByTestId('template-name').fill('Atelier Nord');
  await tool('Resize');
  await page.getByRole('button', { name: 'A4 Portrait', exact: true }).click();
  await tool('Background');
  await page.getByRole('button', { name: 'Cloud', exact: true }).click();

  await tool('Elements');
  await page.getByRole('button', { name: 'Rectangle', exact: true }).click();
  await pick(0);
  await xf({
    left: mm(12),
    top: mm(14),
    width: mm(3),
    height: mm(38),
    fill: '#b45309',
    sendToBack: true,
  });
  await lock();

  await tool('Text');
  await page.getByTestId('add-heading').click();
  await pick(1);
  await xf({
    left: mm(20),
    top: mm(16),
    fill: '#1c1917',
    fontFamily: '"Libre Baskerville", Georgia, serif',
    fontSize: 32,
  });
  await text('Atelier Nord');

  await tool('Text');
  await page.getByRole('button', { name: 'Create sub-header', exact: true }).click();
  await pick(2);
  await xf({
    left: mm(20),
    top: mm(26),
    fill: '#78716c',
    fontFamily: '"Source Sans 3", system-ui, sans-serif',
    fontSize: 11,
  });
  await text('Exhibition architecture  ·  Copenhagen');

  await tool('Elements');
  await page.getByTestId('add-line').click();
  await pick(3);
  await xf({
    line: { x1: mm(20), y1: mm(34), x2: mm(198), y2: mm(34) },
    stroke: '#1c1917',
    strokeWidth: 0.75,
  });

  await tool('Text');
  await page.getByTestId('add-body').click();
  await pick(4);
  await xf({
    left: mm(20),
    top: mm(38),
    fill: '#57534e',
    fontFamily: '"Source Sans 3", system-ui, sans-serif',
    fontSize: 10,
  });
  await text(
    'Vesterbrogade 12  ·  1620 København V\n+45 33 12 90 00  ·  studio@ateliernord.dk',
  );

  return await page.evaluate(() => window.__letterheadEditor.exportPayload());
}
