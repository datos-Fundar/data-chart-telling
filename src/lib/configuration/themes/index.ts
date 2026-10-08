import type { PlotStylesConfigInput } from '$lib/types/configuration/styling';
import { DEFAULT_THEME } from './default';
import { EDITORIAL_THEME } from './editorial';
import { DARK_THEME } from './dark';
import { COMPACT_THEME } from './compact';

/**
 * Ready-made theme presets - partial configs deep-merged over
 * `DEFAULT_CONFIG` by `setConfiguration`. `DEFAULT_CONFIG` itself stays an
 * opinion-free no-op (`font: 'inherit'`, `color: 'currentColor'`, …); these
 * are the actual visual identities consumers can opt into.
 */
export const THEMES = {
	Default: DEFAULT_THEME,
	Editorial: EDITORIAL_THEME,
	Dark: DARK_THEME,
	Compact: COMPACT_THEME
} satisfies Record<string, PlotStylesConfigInput>;

export type ThemeName = keyof typeof THEMES;
