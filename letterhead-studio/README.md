# Letterhead Studio

Browser-based **letterhead template editor** demo built with **React**, **Vite**, and **Fabric.js**. It covers fixed page sizes, design vs. use-template modes, locked vs. editable fields, and print-oriented export.

## Quick start

```bash
cd letterhead-studio
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Features

Polotno-style **studio shell** on Fabric: left tool rail (Templates, Text, Elements, Draw, Upload, Background, Layers, Resize), context panel, top bar (undo/redo, download), and zoom footer.

| Area | What you get |
|------|----------------|
| **Page sizes** | A4, US Letter, Legal, Executive (mm-accurate artboard at 96 DPI on screen) |
| **Design mode** | Add heading, body block, divider, shapes; upload logo; layer order; lock / field flags |
| **Use template mode** | Only objects marked **editable field** can be selected; text edited in the inspector |
| **Templates** | Blank canvas; save/load JSON templates you build yourself |
| **Guides** | 12 mm safe margin overlay (excluded from export) |
| **Export** | PNG @ 300 DPI, PDF (page-sized), JSON template save/load |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — serve production build
- `npm run test:e2e` — Playwright tests (builds and previews automatically)

## MCP (Cursor)

This repo includes [Playwright MCP](https://github.com/microsoft/playwright-mcp) in [`.cursor/mcp.json`](../.cursor/mcp.json) for agent-driven browser testing (snapshots, clicks, forms).

1. Open **Cursor Settings → MCP** and enable the **playwright** server for this workspace (or reload the window).
2. Start the app: `npm run dev` (default `http://localhost:5173`).
3. Ask the agent to navigate and exercise the editor (e.g. export, Use template mode).

## Architecture notes

- Canvas pixel size: `(mm / 25.4) × editorDpi` with `editorDpi = 96` for editing.
- Export uses Fabric `toDataURL` with `multiplier = 300/96` for print-resolution raster output.
- Custom object metadata (`letterhead`: role, locked, placeholder, label) is serialized via `FabricObject.customProperties`.

## Defaults (no questions needed)

- Single-page letterhead only (no multipage memo body).
- RGB color space (typical for web canvas); suitable for office print, not prepress CMYK.
- No backend — templates are client-side JSON and downloads.
