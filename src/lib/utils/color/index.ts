export { CssColor } from './CssColor';
export { ColorRamp } from './ColorRamp';
export { Palette } from './Palette';

import { CssColor } from './CssColor';
import { ColorRamp } from './ColorRamp';
import { Palette } from './Palette';

// The package's public function names, over the classes above.
export const resolveCssColor = (color: string) => CssColor.resolve(color);
export const contrastRatio = (colorA: string, colorB: string) =>
	CssColor.contrastRatio(colorA, colorB);
export const contrastTextColor = (background: string, candidates?: string[]) =>
	CssColor.contrastText(background, candidates);
export const normalize = (v: number, min: number, max: number) => ColorRamp.normalize(v, min, max);
export const makeColorScale = (min: number, max: number, colorMin: string, colorMax: string) =>
	ColorRamp.between(min, max, colorMin, colorMax);
export const resolveColorScale = ColorRamp.resolve;
export const paletteColor = (index: number, palette: string[]) => Palette.at(index, palette);
