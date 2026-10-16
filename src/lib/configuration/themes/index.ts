import type { PlotStylesConfigInput } from '$lib/types/configuration/styling';
import { DEFAULT_THEME } from './default';
import { EDITORIAL_THEME } from './editorial';
import { DARK_THEME } from './dark';
import { COMPACT_THEME } from './compact';

/**
 * Ready-made theme presets - partial configs deep-merged over
 * `DEFAULT_CONFIG` by `setConfiguration`. `DEFAULT_CONFIG` itself stays
 * opinion-free (`font: 'inherit'`, `color: 'currentColor'`, …), following the
 * host project's styles; these are the visual identities consumers can opt
 * into, `Default` being the plain one with a system sans-serif font.
 */
export const THEMES = {
	Default: DEFAULT_THEME,
	Editorial: EDITORIAL_THEME,
	Dark: DARK_THEME,
	Compact: COMPACT_THEME
} satisfies Record<string, PlotStylesConfigInput>;

export type ThemeName = keyof typeof THEMES;
