# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: build-occasion-templates.spec.ts >> build occasion letterhead templates via editor
- Location: e2e/build-occasion-templates.spec.ts:28:1

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Resize', exact: true }) resolved to 2 elements:
    1) <button type="button" title="Resize" aria-label="Resize" aria-current="page" class="studio-rail-btn active">…</button> aka getByRole('button', { name: 'Resize', description: 'Resize' })
    2) <button type="button" data-testid="resize-apply" class="studio-resize-apply-btn">Resize</button> aka getByTestId('resize-apply')

Call log:
  - waiting for getByRole('button', { name: 'Resize', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "Letterhead Studio" [level=1] [ref=e4]
  - navigation "Editor tools" [ref=e5]:
    - button "Templates" [ref=e6] [cursor=pointer]
    - button "Text" [ref=e12] [cursor=pointer]
    - button "Elements" [ref=e16] [cursor=pointer]
    - button "Draw" [ref=e21] [cursor=pointer]
    - button "Upload" [ref=e26] [cursor=pointer]
    - button "Background" [ref=e30] [cursor=pointer]
    - button "Layers" [ref=e37] [cursor=pointer]
    - button "Resize" [active] [ref=e42] [cursor=pointer]
    - button "Switch to dark mode" [ref=e47] [cursor=pointer]:
      - generic [ref=e50]: Dark
  - complementary [ref=e51]:
    - button "Collapse panel" [ref=e52] [cursor=pointer]
    - complementary "resize options" [ref=e56]:
      - heading "Resize" [level=2] [ref=e58]
      - generic [ref=e60]:
        - generic [ref=e61]:
          - generic [ref=e62]:
            - text: Use magic resize
            - button "Magic resize help" [ref=e64] [cursor=pointer]
          - generic [ref=e69] [cursor=pointer]:
            - checkbox [checked]
        - generic [ref=e71]:
          - generic [ref=e72]: Width (px)
          - spinbutton "Width (px)" [ref=e73]: "816"
        - generic [ref=e74]:
          - generic [ref=e75]: Height (px)
          - spinbutton "Height (px)" [ref=e76]: "1056"
        - generic [ref=e77]:
          - generic [ref=e78]: Units
          - combobox "Units" [ref=e79]:
            - option "px" [selected]
            - option "cm"
            - option "in"
        - button "Resize" [ref=e80] [cursor=pointer]
        - generic [ref=e81]:
          - generic [ref=e82]:
            - heading "Instagram" [level=3] [ref=e83]
            - generic [ref=e88]:
              - button "Post 1080×1080 px" [ref=e89] [cursor=pointer]:
                - generic [ref=e91]: Post
                - generic [ref=e92]: 1080×1080 px
              - button "Story 1080×1920 px" [ref=e93] [cursor=pointer]:
                - generic [ref=e95]: Story
                - generic [ref=e96]: 1080×1920 px
              - button "Ad 1080×1080 px" [ref=e97] [cursor=pointer]:
                - generic [ref=e99]: Ad
                - generic [ref=e100]: 1080×1080 px
          - generic [ref=e101]:
            - heading "Facebook" [level=3] [ref=e102]
            - generic [ref=e105]:
              - button "Post (Landscape) 1200×630 px" [ref=e106] [cursor=pointer]:
                - generic [ref=e108]: Post (Landscape)
                - generic [ref=e109]: 1200×630 px
              - button "Post (Square) 1080×1080 px" [ref=e110] [cursor=pointer]:
                - generic [ref=e112]: Post (Square)
                - generic [ref=e113]: 1080×1080 px
              - button "Cover 851×315 px" [ref=e114] [cursor=pointer]:
                - generic [ref=e116]: Cover
                - generic [ref=e117]: 851×315 px
          - generic [ref=e118]:
            - heading "Youtube" [level=3] [ref=e119]
            - generic [ref=e123]:
              - button "Thumbnail 1280×720 px" [ref=e124] [cursor=pointer]:
                - generic [ref=e126]: Thumbnail
                - generic [ref=e127]: 1280×720 px
              - button "Channel 2560×1440 px" [ref=e128] [cursor=pointer]:
                - generic [ref=e130]: Channel
                - generic [ref=e131]: 2560×1440 px
              - button "Short 1080×1920 px" [ref=e132] [cursor=pointer]:
                - generic [ref=e134]: Short
                - generic [ref=e135]: 1080×1920 px
          - generic [ref=e136]:
            - heading "LinkedIn" [level=3] [ref=e137]
            - generic [ref=e142]:
              - button "Post 1200×627 px" [ref=e143] [cursor=pointer]:
                - generic [ref=e145]: Post
                - generic [ref=e146]: 1200×627 px
              - button "Banner 1584×396 px" [ref=e147] [cursor=pointer]:
                - generic [ref=e149]: Banner
                - generic [ref=e150]: 1584×396 px
              - button "Square 1080×1080 px" [ref=e151] [cursor=pointer]:
                - generic [ref=e153]: Square
                - generic [ref=e154]: 1080×1080 px
          - generic [ref=e155]:
            - heading "Twitter" [level=3] [ref=e156]
            - generic [ref=e159]:
              - button "Post 1600×900 px" [ref=e160] [cursor=pointer]:
                - generic [ref=e162]: Post
                - generic [ref=e163]: 1600×900 px
              - button "Header 1500×500 px" [ref=e164] [cursor=pointer]:
                - generic [ref=e166]: Header
                - generic [ref=e167]: 1500×500 px
              - button "Square 1080×1080 px" [ref=e168] [cursor=pointer]:
                - generic [ref=e170]: Square
                - generic [ref=e171]: 1080×1080 px
          - generic [ref=e172]:
            - heading "Video" [level=3] [ref=e173]
            - generic [ref=e177]:
              - button "Full HD 1920×1080 px" [ref=e178] [cursor=pointer]:
                - generic [ref=e180]: Full HD
                - generic [ref=e181]: 1920×1080 px
              - button "4K UHD 3840×2160 px" [ref=e182] [cursor=pointer]:
                - generic [ref=e184]: 4K UHD
                - generic [ref=e185]: 3840×2160 px
              - button "Vertical HD 1080×1920 px" [ref=e186] [cursor=pointer]:
                - generic [ref=e188]: Vertical HD
                - generic [ref=e189]: 1080×1920 px
              - button "Square HD 1080×1080 px" [ref=e190] [cursor=pointer]:
                - generic [ref=e192]: Square HD
                - generic [ref=e193]: 1080×1080 px
          - generic [ref=e194]:
            - heading "Print" [level=3] [ref=e195]
            - generic [ref=e199]:
              - button "Invitation 14×14 cm" [ref=e200] [cursor=pointer]:
                - generic [ref=e202]: Invitation
                - generic [ref=e203]: 14×14 cm
              - button "A4 Portrait 21×29.7 cm" [ref=e204] [cursor=pointer]:
                - generic [ref=e206]: A4 Portrait
                - generic [ref=e207]: 21×29.7 cm
              - button "A4 Landscape 29.7×21 cm" [ref=e208] [cursor=pointer]:
                - generic [ref=e210]: A4 Landscape
                - generic [ref=e211]: 29.7×21 cm
              - button "A3 29.7×42 cm" [ref=e212] [cursor=pointer]:
                - generic [ref=e214]: A3
                - generic [ref=e215]: 29.7×42 cm
              - button "Letter Portrait 8.5×11 in" [pressed] [ref=e216] [cursor=pointer]:
                - generic [ref=e218]: Letter Portrait
                - generic [ref=e219]: 8.5×11 in
              - button "Letter Landscape 11×8.5 in" [ref=e220] [cursor=pointer]:
                - generic [ref=e222]: Letter Landscape
                - generic [ref=e223]: 11×8.5 in
              - button "Business card 3.5×2 in" [ref=e224] [cursor=pointer]:
                - generic [ref=e226]: Business card
                - generic [ref=e227]: 3.5×2 in
              - button "Poster 18×24 in" [ref=e228] [cursor=pointer]:
                - generic [ref=e230]: Poster
                - generic [ref=e231]: 18×24 in
        - group [ref=e232]:
          - generic "Letterhead document" [ref=e233] [cursor=pointer]
          - generic [ref=e234]:
            - generic [ref=e235]:
              - generic [ref=e236]: Page size
              - combobox "Page size" [ref=e237]:
                - option "A4"
                - option "US Letter" [selected]
                - option "Legal"
                - option "Executive"
            - tablist "Orientation" [ref=e238]:
              - tab "Portrait" [ref=e239] [cursor=pointer]
              - tab "Landscape" [ref=e240] [cursor=pointer]
            - tablist "Editor mode" [ref=e241]:
              - tab "Design" [ref=e242] [cursor=pointer]
              - tab "Use template" [ref=e243] [cursor=pointer]
  - generic [ref=e244]:
    - banner [ref=e245]:
      - generic "Sterling Boardroom" [ref=e248]
      - generic [ref=e250]:
        - button "Undo" [disabled] [ref=e251]
        - button "Redo" [disabled] [ref=e254]
      - generic "Page background" [ref=e257] [cursor=pointer]:
        - textbox "Page background" [ref=e259]: "#ffffff"
      - button "Download" [ref=e261] [cursor=pointer]
    - main [ref=e265]:
      - generic [ref=e266]: US Letter · Portrait
      - generic [ref=e267]: 215.9 × 279.4 mm
    - contentinfo [ref=e272]:
      - button "Pages" [ref=e273] [cursor=pointer]
      - generic [ref=e274]:
        - button "Zoom out" [ref=e275] [cursor=pointer]: −
        - generic [ref=e276]: 100%
        - button "Zoom in" [ref=e277] [cursor=pointer]: +
```

# Test source

```ts
  1   | import type { Page } from '@playwright/test';
  2   | import { expect } from '@playwright/test';
  3   | 
  4   | export const FORMATS = [
  5   |   { id: 'a4', label: 'A4', w: 210, h: 297 },
  6   |   { id: 'us-letter', label: 'US Letter', w: 215.9, h: 279.4 },
  7   |   { id: 'legal', label: 'Legal', w: 215.9, h: 355.6 },
  8   |   { id: 'executive', label: 'Executive', w: 184.15, h: 266.7 },
  9   | ] as const;
  10  | 
  11  | export async function gotoEditor(page: Page) {
  12  |   await page.goto('/');
  13  |   await expect(page.getByTestId('toolbar')).toBeVisible();
  14  |   await page.waitForFunction(() => window.__letterheadEditor?.getCounts() != null);
  15  | }
  16  | 
  17  | export async function studioTool(page: Page, name: string) {
> 18  |   await page.getByRole('button', { name, exact: true }).click();
      |                                                         ^ Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Resize', exact: true }) resolved to 2 elements:
  19  | }
  20  | 
  21  | export async function studioExport(
  22  |   page: Page,
  23  |   kind: 'export-png' | 'export-pdf' | 'export-json',
  24  | ) {
  25  |   if (kind === 'export-json') {
  26  |     await studioTool(page, 'Templates');
  27  |     await page.getByTestId('export-json').click();
  28  |     return;
  29  |   }
  30  |   await page.getByRole('button', { name: 'Download' }).click();
  31  |   await page.getByTestId(kind).click();
  32  | }
  33  | 
  34  | export async function editorCounts(page: Page) {
  35  |   return page.evaluate(() => window.__letterheadEditor!.getCounts()!);
  36  | }
  37  | 
  38  | export async function canvasSize(page: Page) {
  39  |   return page.evaluate(() => window.__letterheadEditor!.getCanvasPixelSize());
  40  | }
  41  | 
  42  | export function mmToPx300(wMm: number, hMm: number) {
  43  |   const px = (mm: number) => Math.round((mm / 25.4) * 300);
  44  |   return { width: px(wMm), height: px(hMm) };
  45  | }
  46  | 
  47  | export function pngDimensions(buffer: Buffer) {
  48  |   return {
  49  |     width: buffer.readUInt32BE(16),
  50  |     height: buffer.readUInt32BE(20),
  51  |   };
  52  | }
  53  | 
  54  | /** Parse first MediaBox from a PDF buffer (points). */
  55  | export function pdfMediaBoxPoints(buffer: Buffer): { w: number; h: number } | null {
  56  |   const text = buffer.toString('latin1');
  57  |   const match = text.match(/\/MediaBox\s*\[\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)\s*\]/);
  58  |   if (!match) return null;
  59  |   return { w: parseFloat(match[1]), h: parseFloat(match[2]) };
  60  | }
  61  | 
  62  | export function mmToPdfPoints(mm: number) {
  63  |   return (mm / 25.4) * 72;
  64  | }
  65  | 
  66  | export function expectedSafeMarginRatios(
  67  |   pageWidthMm: number,
  68  |   pageHeightMm: number,
  69  |   marginMm: number,
  70  | ) {
  71  |   return {
  72  |     widthRatio: (pageWidthMm - marginMm * 2) / pageWidthMm,
  73  |     heightRatio: (pageHeightMm - marginMm * 2) / pageHeightMm,
  74  |   };
  75  | }
  76  | 
  77  | /** Sample PNG RGBA at x,y (top-left). */
  78  | export function pngPixelRgba(buffer: Buffer, x: number, y: number) {
  79  |   const width = buffer.readUInt32BE(16);
  80  |   const height = buffer.readUInt32BE(20);
  81  |   if (x < 0 || y < 0 || x >= width || y >= height) return null;
  82  |   let offset = 8;
  83  |   while (offset < buffer.length) {
  84  |     const len = buffer.readUInt32BE(offset);
  85  |     const type = buffer.toString('ascii', offset + 4, offset + 8);
  86  |     if (type === 'IDAT') break;
  87  |     offset += 12 + len;
  88  |   }
  89  |   return null;
  90  | }
  91  | 
  92  | declare global {
  93  |   interface Window {
  94  |     __letterheadEditor?: {
  95  |       getCounts: () => { total: number; content: number; guides: number };
  96  |       getCanvasPixelSize: () => { width: number; height: number };
  97  |       isGuideVisible: () => boolean;
  98  |       getActiveType: () => string | null;
  99  |       moveActive: (left: number, top: number) => boolean;
  100 |       moveActiveClamped: (left: number, top: number) => boolean;
  101 |       getActivePosition: () => { left: number; top: number } | null;
  102 |       getStackRoles: () => string[];
  103 |       getLogoWidthPx: () => number | null;
  104 |       getViewportZoom: () => number;
  105 |       selectContentIndex?: (index: number) => void;
  106 |       transformActive?: (patch: {
  107 |         left?: number;
  108 |         top?: number;
  109 |         width?: number;
  110 |         height?: number;
  111 |         fill?: string;
  112 |         stroke?: string;
  113 |         strokeWidth?: number;
  114 |         opacity?: number;
  115 |         fontSize?: number;
  116 |         fontFamily?: string;
  117 |         line?: { x1: number; y1: number; x2: number; y2: number };
  118 |         sendToBack?: boolean;
```