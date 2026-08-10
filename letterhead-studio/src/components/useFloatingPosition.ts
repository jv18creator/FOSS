import {
  useCallback,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

export type FloatingPlacement = 'top' | 'bottom' | 'left' | 'right';

const VIEWPORT_PAD = 8;

function place(
  anchor: DOMRect,
  tip: DOMRect,
  placement: FloatingPlacement,
  gap: number,
): { top: number; left: number } {
  switch (placement) {
    case 'top':
      return {
        top: anchor.top - gap - tip.height,
        left: anchor.left + anchor.width / 2 - tip.width / 2,
      };
    case 'bottom':
      return {
        top: anchor.bottom + gap,
        left: anchor.left + anchor.width / 2 - tip.width / 2,
      };
    case 'left':
      return {
        top: anchor.top + anchor.height / 2 - tip.height / 2,
        left: anchor.left - gap - tip.width,
      };
    case 'right':
      return {
        top: anchor.top + anchor.height / 2 - tip.height / 2,
        left: anchor.right + gap,
      };
  }
}

function fitsViewport(top: number, left: number, tip: DOMRect): boolean {
  return (
    top >= VIEWPORT_PAD &&
    left >= VIEWPORT_PAD &&
    top + tip.height <= window.innerHeight - VIEWPORT_PAD &&
    left + tip.width <= window.innerWidth - VIEWPORT_PAD
  );
}

function clampToViewport(top: number, left: number, tip: DOMRect): { top: number; left: number } {
  const maxLeft = window.innerWidth - VIEWPORT_PAD - tip.width;
  const maxTop = window.innerHeight - VIEWPORT_PAD - tip.height;
  return {
    top: Math.min(Math.max(top, VIEWPORT_PAD), maxTop),
    left: Math.min(Math.max(left, VIEWPORT_PAD), maxLeft),
  };
}

function computePosition(
  anchor: DOMRect,
  tip: DOMRect,
  preferred: FloatingPlacement,
  gap: number,
): { top: number; left: number } {
  const order: FloatingPlacement[] = [preferred];
  if (preferred === 'bottom' || preferred === 'top') {
    order.push(preferred === 'bottom' ? 'top' : 'bottom', 'right', 'left');
  } else {
    order.push(preferred === 'right' ? 'left' : 'right', 'bottom', 'top');
  }

  for (const placement of order) {
    const { top, left } = place(anchor, tip, placement, gap);
    if (fitsViewport(top, left, tip)) {
      return { top, left };
    }
  }

  const fallback = place(anchor, tip, preferred, gap);
  return clampToViewport(fallback.top, fallback.left, tip);
}

export function useFloatingPosition(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  tipRef: RefObject<HTMLElement | null>,
  preferredPlacement: FloatingPlacement,
  gap: number,
  contentKey: unknown,
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({
    position: 'fixed',
    visibility: 'hidden',
    zIndex: 10000,
  });

  const update = useCallback(() => {
    const anchorEl = anchorRef.current;
    const tipEl = tipRef.current;
    if (!anchorEl || !tipEl) return;
    const anchor = anchorEl.getBoundingClientRect();
    const tip = tipEl.getBoundingClientRect();
    const { top, left } = computePosition(anchor, tip, preferredPlacement, gap);
    setStyle({
      position: 'fixed',
      top,
      left,
      zIndex: 10000,
      visibility: 'visible',
    });
  }, [anchorRef, tipRef, preferredPlacement, gap]);

  useLayoutEffect(() => {
    if (!open) {
      setStyle({
        position: 'fixed',
        visibility: 'hidden',
        zIndex: 10000,
      });
      return;
    }
    update();
    const onChange = () => update();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [open, update, contentKey]);

  return style;
}
