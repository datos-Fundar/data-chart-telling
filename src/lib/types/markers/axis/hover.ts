import type { AreaStyle, DotStyle, FontStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { HoverDisplayPoint, HoverStrategy } from '$lib/types/layout/hover';
import type { NumberDisplay } from '$lib/types/layout/numbers';

/**
 * In-SVG hover highlight: crosshair, dot and label. The label is the hovered value as `decimals`, `prefix`,
 * `suffix` and `signDisplay` write it - as the plot writes it while none of them (nor `numbers.decimals`) is set -
 * unless `format` writes it.
 */
export type HoverMarkerConfig = NumberDisplay & {
	type: 'hover';
	series?: string;
	scope?: 'series' | 'segment';
	strategy?: HoverStrategy;
	sync?: boolean;
	ruleX?: boolean;
	ruleY?: boolean;
	/** A thickened highlight area in place of a thin crosshair; meaningful on band scales only. */
	areaX?: boolean;
	areaY?: boolean;
	showLabels?: boolean;
	/** The label's text for a point, in place of the value. `number` writes a value as the display fields above ask. */
	format?: (point: HoverDisplayPoint, number: (value: number) => string) => string;
	rule?: StrokeStyle;
	area?: AreaStyle;
	dot?: DotStyle;
	text?: FontStyle;
};
