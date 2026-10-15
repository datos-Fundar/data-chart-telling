import type { Snippet } from 'svelte';
import type { HoverStrategy } from '$lib/types/layout/hover';

/**
 * Preferred horizontal placement of the tooltip beside the cursor; it moves
 * to the other side when it would overflow. Defaults to `'right'`.
 */
export type TooltipAnchorX = 'left' | 'middle' | 'right';

/** Preferred vertical placement of the tooltip, like {@link TooltipAnchorX}. Defaults to `'bottom'`. */
export type TooltipAnchorY = 'top' | 'middle' | 'bottom';

/** Author-facing tooltip option on the chart kinds. `true` = enable with defaults. */
export type TooltipOptions<TRow extends Record<string, unknown>> = {
	/** Matching strategy. Defaults to the chart kind's own default. */
	strategy?: HoverStrategy;
	/** Highlight the hovered point in every synced plot too. Defaults to `false`. */
	sync?: boolean;
	/** Custom tooltip text for a row (supports `\n`). Defaults per chart kind. */
	format?: (row: TRow) => string;
	/** Named subset of crossing series to include. Omitted = all matched. */
	series?: string[];
	/** Custom tooltip body; replaces `format` when given. */
	content?: Snippet<[{ rows: TRow[] }]>;
	/** Preferred horizontal anchor - see {@link TooltipAnchorX}. */
	anchorX?: TooltipAnchorX;
	/** Preferred vertical anchor - see {@link TooltipAnchorY}. */
	anchorY?: TooltipAnchorY;
};

/** Either a bare on/off flag or the full option object. */
export type TooltipProp<TRow extends Record<string, unknown>> = boolean | TooltipOptions<TRow>;
