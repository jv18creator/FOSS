import type { PageFormat } from '../lib/pageFormats';
import { SAFE_MARGIN_MM } from '../lib/pageFormats';

interface SafeMarginOverlayProps {
  format: PageFormat;
  visible: boolean;
}

export function SafeMarginOverlay({ format, visible }: SafeMarginOverlayProps) {
  if (!visible) return null;

  const insetX = `${(SAFE_MARGIN_MM / format.widthMm) * 100}%`;
  const insetY = `${(SAFE_MARGIN_MM / format.heightMm) * 100}%`;

  return (
    <div
      className="safe-margin-overlay"
      data-testid="safe-margin-overlay"
      aria-hidden
      style={{
        top: insetY,
        right: insetX,
        bottom: insetY,
        left: insetX,
      }}
    />
  );
}
