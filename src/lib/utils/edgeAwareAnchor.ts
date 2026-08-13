export type HorizontalAnchor = 'start' | 'middle' | 'end';
export type VerticalAnchor = 'top' | 'middle' | 'bottom';

/** Rough estimate of rendered text width in pixels — character count × font size, not a real DOM measurement. Shared so a pre-render space reservation (e.g. domain padding) and this file's own overflow check agree on the same number. */
export function estimateTextWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.62;
}

export type AnchorPlacement = {
  textAnchor: HorizontalAnchor;
  lineAnchor: VerticalAnchor;
  dx: number;
  dy: number;
};

/**
 * Flips (or nudges) a label's anchor/offset when its default placement
 * would push it past a pixel box — e.g. the plot's own inner content box.
 * `extent` estimates the rendered label size (character count × font size,
 * not a real DOM measurement) deliberately: measuring via `getBBox()` and
 * feeding the result back into anything reactive to the plot's own layout
 * (like svelteplot's shared margin-auto-sizing context) risks a feedback
 * loop between this component's own effect and svelteplot's — this stays
 * self-contained and read-only against the live scale instead.
 */
export function resolveEdgeAwareAnchor(args: {
  /** Pixel position of the anchored point. */
  px: number;
  py: number;
  /** Size of the box the label must stay within — typically the plot's own inner content box. */
  width: number;
  height: number;
  textAnchor: HorizontalAnchor;
  lineAnchor: VerticalAnchor;
  /** Desired distance from the point, in pixels — sign is resolved from the (possibly flipped) anchor. */
  gapX: number;
  gapY: number;
  extent: { width: number; height: number };
}): AnchorPlacement {
  const { px, py, width, height, gapX, gapY, extent } = args;
  let { textAnchor, lineAnchor } = args;
  let dx: number;
  let dy: number;

  if (textAnchor === 'start') {
    dx = gapX;
    if (px + dx + extent.width > width) {
      textAnchor = 'end';
      dx = -gapX;
    }
  } else if (textAnchor === 'end') {
    dx = -gapX;
    if (px + dx - extent.width < 0) {
      textAnchor = 'start';
      dx = gapX;
    }
  } else {
    const half = extent.width / 2;
    dx = 0;
    if (px - half < 0) dx = half - px;
    else if (px + half > width) dx = width - (px + half);
  }

  if (lineAnchor === 'top') {
    dy = gapY;
    if (py + dy + extent.height > height) {
      lineAnchor = 'bottom';
      dy = -gapY;
    }
  } else if (lineAnchor === 'bottom') {
    dy = -gapY;
    if (py + dy - extent.height < 0) {
      lineAnchor = 'top';
      dy = gapY;
    }
  } else {
    const half = extent.height / 2;
    dy = 0;
    if (py - half < 0) dy = half - py;
    else if (py + half > height) dy = height - (py + half);
  }

  return { textAnchor, lineAnchor, dx, dy };
}
