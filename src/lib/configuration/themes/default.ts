import { SYSTEM_FONT } from '$lib/configuration/fonts';
import type { PlotStylesConfigInput } from '$lib/types/configuration/styling';

/**
 * The shipped look: `DEFAULT_CONFIG` plus a system sans-serif font. The
 * configuration itself keeps `font: 'inherit'`, so a plot follows its
 * project's own font; apply this theme where there is none (a new project, a
 * Storybook) to avoid the browser's default serif.
 */
export const DEFAULT_THEME: PlotStylesConfigInput = { font: SYSTEM_FONT };
