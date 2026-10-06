import type { AreaStyle, DotStyle, FontStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { HoverDisplayPoint, HoverStrategy } from '$lib/types/layout/tooltip';
import type { ClipUnawareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** In-SVG hover highlight: crosshair, dot and label. */
export type HoverMarkerConfig = {
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
	format?: (point: HoverDisplayPoint) => string;
	rule?: StrokeStyle;
	area?: AreaStyle;
	dot?: DotStyle;
	text?: FontStyle;
} & ClipUnawareMarkerConfig;
