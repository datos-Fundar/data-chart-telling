import type { GeoInsetLocation } from '$lib/types/markers/geo';

type Horizontal = 'left' | 'middle' | 'right';
type Vertical = 'top' | 'middle' | 'bottom';

/**
 * Parses a `side-anchor` position string (either word order accepted - see
 * `GeoInsetLocation`) into independent horizontal/vertical placement
 * keywords.
 */
export function parseInsetLocation(location: GeoInsetLocation): { h: Horizontal; v: Vertical } {
  const parts = location.split('-');
  let h: Horizontal | undefined;
  let v: Vertical | undefined;
  for (const part of parts) {
    if (part === 'left' || part === 'right') h = part;
    else if (part === 'top' || part === 'bottom') v = part;
  }
  // Any leftover 'middle' fills whichever axis wasn't claimed above.
  for (const part of parts) {
    if (part !== 'middle') continue;
    if (v === undefined) v = 'middle';
    else if (h === undefined) h = 'middle';
  }
  return { h: h ?? 'middle', v: v ?? 'middle' };
}

export type InsetBox = { left: number; top: number; width: number; height: number };

/**
 * Computes an inset's pixel rectangle within a `frameWidth`×`frameHeight`
 * area, anchored per `location` and `margin` pixels from whichever edge(s)
 * it's anchored to.
 */
export function insetBox(
  location: GeoInsetLocation,
  widthFraction: number,
  heightFraction: number,
  margin: number,
  frameWidth: number,
  frameHeight: number,
): InsetBox {
  const { h, v } = parseInsetLocation(location);
  const width = frameWidth * widthFraction;
  const height = frameHeight * heightFraction;
  const left = h === 'left' ? margin : h === 'right' ? frameWidth - margin - width : (frameWidth - width) / 2;
  const top = v === 'top' ? margin : v === 'bottom' ? frameHeight - margin - height : (frameHeight - height) / 2;
  return { left, top, width, height };
}
