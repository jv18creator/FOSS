import {
  cloneElement,
  isValidElement,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  useFloatingPosition,
  type FloatingPlacement,
} from './useFloatingPosition';

export type StudioFloatingTipVariant = 'tooltip' | 'popover';

export interface StudioFloatingTipProps {
  content: ReactNode;
  children: ReactElement;
  variant?: StudioFloatingTipVariant;
  placement?: FloatingPlacement;
  gap?: number;
  /** Merged onto the trigger for accessibility */
  triggerAriaLabel?: string;
}

export function StudioFloatingTip({
  content,
  children,
  variant = 'tooltip',
  placement = 'bottom',
  gap = 6,
  triggerAriaLabel,
}: StudioFloatingTipProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipId = useId();

  const tipStyle = useFloatingPosition(open, anchorRef, tipRef, placement, gap, content);

  if (!isValidElement(children)) {
    throw new Error('StudioFloatingTip expects a single React element child');
  }

  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    'aria-expanded': open,
    'aria-describedby': open ? tipId : undefined,
    ...(triggerAriaLabel ? { 'aria-label': triggerAriaLabel } : {}),
    onClick: (e: MouseEvent) => {
      const childOnClick = (children as ReactElement<{ onClick?: (e: MouseEvent) => void }>).props
        .onClick;
      childOnClick?.(e);
      setOpen((o) => !o);
    },
  });

  const tipClass =
    variant === 'popover'
      ? 'studio-floating-tip studio-floating-tip--popover'
      : 'studio-floating-tip studio-floating-tip--tooltip';

  return (
    <span
      ref={anchorRef}
      className="studio-floating-tip-anchor"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      {trigger}
      {open
        ? createPortal(
            <div
              ref={tipRef}
              id={tipId}
              role="tooltip"
              className={tipClass}
              style={tipStyle}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
