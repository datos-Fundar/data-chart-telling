import type { AxisBasedMarkersConfig } from '$lib/types/markers/axis/axisBasedMarkersConfig';
import type { HoverDisplayPoint, HoverStrategy } from '$lib/types/layout/hover';
import type { NumberDisplay } from '$lib/types/layout/numbers';
import type { LineStyle } from '$lib/types/plots/constants';

/** A style value: the same for every shape, or a function of the row a shape draws. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ShapeStyleValue<T> = T | ((row: any) => T);

/**
 * How the shapes of a marker linked to the hover (`hover: true` or `'style'`) look while the hover is on: the
 * hovered ones under `active`, the rest under `others`. Each value replaces the shape's own, and may be a
 * function of its row.
 */
export type HoverShapeStyle = {
	fill?: ShapeStyleValue<string>;
	fillOpacity?: ShapeStyleValue<number>;
	stroke?: ShapeStyleValue<string>;
	strokeWidth?: ShapeStyleValue<number>;
	strokeOpacity?: ShapeStyleValue<number>;
	strokeDasharray?: string | LineStyle;
};

/** `T` with its `K` fields left to be set. */
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** A marker as the hover takes it: a `rule`'s and a `band`'s `value` and a `text`'s `text` default to the point's. */
type InHover<T> = T extends { type: 'rule' | 'band' }
	? Optional<T, 'value' & keyof T>
	: T extends { type: 'text' }
		? Optional<T, 'text' & keyof T>
		: T;

/**
 * A marker the hover draws: any marker but another hover, over the hovered points. Without `data` of its own its
 * rows are the points - each its `x`, `y`, `label` (written as the hover marker's number fields ask), `series`,
 * `color` (its series'), `areaInset` (its slice of the band) and `row` (the row it stands for) - and its `x` and
 * `y` default to the point's. What it leaves unset comes from the hover: a `rule` sits at each point along its
 * `axis`, a `band` around it (in its series' slice), a `text` writes its label; each in the configuration's `hover`
 * look (a `rect` in its `area`), and a `dot` and a `text` in the point's series color.
 */
export type HoverLayerMarker = InHover<Exclude<AxisBasedMarkersConfig, { type: 'hover' }>> & {
	/**
	 * Which points it draws: every one the hover matches (the default), only the one under the pointer, or those a
	 * function of the point keeps.
	 */
	points?: 'all' | 'active' | ((point: HoverDisplayPoint) => boolean);
};

/**
 * The plot's hover, inside the plot: how the hovered shapes look (`active`) and the rest (`others`), and the
 * markers it draws behind the plot's shapes (`back`) and in front of them (`front`) - a rule, a band, a dot, a
 * label, a component. Each plot kind has a hover of its own that this one is laid over: `active` and `others`
 * field by field, `back` and `front` replacing the kind's lists when set (`back: []` draws nothing behind).
 * The points' label is the hovered value as `decimals`, `prefix`, `suffix` and `signDisplay` write it - as the
 * plot writes it while none of them (nor `numbers.decimals`) is set - unless `format` writes it.
 */
export type HoverMarkerConfig = NumberDisplay & {
	type: 'hover';
	series?: string;
	scope?: 'series' | 'segment';
	strategy?: HoverStrategy;
	sync?: boolean;
	/** How the hovered shapes of every marker linked to the hover look - the plot's own tiles, bars and cells among them. */
	active?: HoverShapeStyle;
	/** How the shapes the hover does not reach look, while it is on. */
	others?: HoverShapeStyle;
	/** The markers drawn behind every other one of the plot, over the hovered points. */
	back?: HoverLayerMarker[];
	/** The markers drawn in front of the plot's shapes, over the hovered points. */
	front?: HoverLayerMarker[];
	/** A point's label, in place of its value. `number` writes a value as the display fields above ask. */
	format?: (point: HoverDisplayPoint, number: (value: number) => string) => string;
};

/** What a plot kind's own hover is made of, which an author's `hover` marker is laid over. */
export type HoverLook = Pick<HoverMarkerConfig, 'active' | 'others' | 'back' | 'front'>;
