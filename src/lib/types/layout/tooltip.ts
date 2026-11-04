import type { Snippet } from 'svelte';
import type { HoverStrategy } from '$lib/types/layout/hover';
import type { NumberDisplay } from '$lib/types/layout/numbers';

/**
 * Preferred horizontal placement of the tooltip beside the cursor; it moves
 * to the other side when it would overflow. Defaults to `'right'`.
 */
export type TooltipAnchorX = 'left' | 'middle' | 'right';

/** Preferred vertical placement of the tooltip, like {@link TooltipAnchorX}. Defaults to `'bottom'`. */
export type TooltipAnchorY = 'top' | 'middle' | 'bottom';

/** A matched row as a tooltip's `content` gets it: the row itself, plus `seriesColor`, the one the plot draws it in (unset on plots without series). */
export type TooltipRow<TRow> = TRow & { seriesColor?: string };

/**
 * Author-facing tooltip option on the chart kinds. `true` = enable with defaults. `decimals`, `prefix`,
 * `suffix` and `signDisplay` write the value the default text shows - the one on the plot's value axis (the
 * x of a horizontal bar chart), and a heatmap's color value - and the numbers a custom `format` writes with its `number`.
 */
export type TooltipOptions<TRow extends Record<string, unknown>> = NumberDisplay & {
	/** Matching strategy. Defaults to the chart kind's own default. */
	strategy?: HoverStrategy;
	/** Highlight the hovered point in every synced plot too. Defaults to `false`. */
	sync?: boolean;
	/** Custom tooltip text for a row (supports `\n`). Defaults per chart kind. `number` writes a value as the display fields above ask. */
	format?: (row: TRow, number: (value: number) => string) => string;
	/** Named subset of crossing series to include. Omitted = all matched. */
	series?: string[];
	/** Custom tooltip body; replaces `format` when given. Its rows carry a `seriesColor` - see {@link TooltipRow}. */
	content?: Snippet<[{ rows: TooltipRow<TRow>[] }]>;
	/** Preferred horizontal anchor - see {@link TooltipAnchorX}. */
	anchorX?: TooltipAnchorX;
	/** Preferred vertical anchor - see {@link TooltipAnchorY}. */
	anchorY?: TooltipAnchorY;
};

/** Either a bare on/off flag or the full option object. */
export type TooltipProp<TRow extends Record<string, unknown>> = boolean | TooltipOptions<TRow>;
