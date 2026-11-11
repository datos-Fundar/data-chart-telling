import { MarkerStyles } from '$lib/phases/markers/MarkerStyles';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { RowStyle } from '$lib/markers/utils/RowStyle';
import type { HoverShapeStyle } from '$lib/types/markers/common';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

type Row = Record<string, unknown>;
type Role = 'active' | 'other';
type Field = keyof HoverShapeStyle;
type Read = (row: Row, index: number) => unknown;

/** What a hover marker sets for the shapes linked to the hover. */
type ShapeRule = { active?: HoverShapeStyle; others?: HoverShapeStyle; series?: string };

/** What the plot tells about each row the shapes draw. */
export type HoverShapesReach = {
	/** How the hover reaches a row - see `PlotHover.roleOf`. */
	roleOf: (row: Row, series?: string) => Role | null;
	/** Whether the legend dims the row's series, which then keeps its own fill and opacities. */
	dimmed: (row: Row) => boolean;
	cfg: PlotStylesConfig;
};

/**
 * The look the plot's hover markers give the shapes of every marker linked to the hover (`hover: true` or
 * `'style'`): the hovered ones take `active`, the others `others`, each over the shape's own style. A shape
 * the legend dims keeps its own fill and opacities; one the hover cannot reach (hidden, omitted) is untouched.
 *
 * The marker stays one marker over all its rows, whatever is hovered: each style the hover sets is a function of
 * the row that asks the hover how it reaches it. Moving the pointer then only draws the marker's shapes again in
 * their new look - their rows and options do not change, so svelteplot never works the plot's scales out again
 * (it does so from every mark's data and options, and a style with no scale is never read for them).
 */
export class HoverShapes {
	/** What the legend owns on a dimmed shape. */
	static readonly #LEGEND_KEYS = new Set<Field>(['fill', 'fillOpacity', 'strokeOpacity']);

	/** The fields that draw a shape's outline. */
	static readonly #OUTLINE_KEYS: Field[] = [
		'stroke',
		'strokeWidth',
		'strokeOpacity',
		'strokeDasharray'
	];

	/** The fields that hold an opacity, fully opaque unless set. */
	static readonly #OPACITY_KEYS = new Set<Field>(['fillOpacity', 'strokeOpacity']);

	/** The fields that hold a color: a string is the field of the rows it names, else the color itself. */
	static readonly #COLOR_KEYS = new Set<Field>(['fill', 'stroke']);

	/** A shape style's field as a `dot` marker names it. */
	static readonly #DOT_KEYS: Record<Field, string> = {
		fill: 'dotFill',
		fillOpacity: 'dotFillOpacity',
		stroke: 'dotStroke',
		strokeWidth: 'dotStrokeWidth',
		strokeOpacity: 'dotStrokeOpacity',
		strokeDasharray: 'dotStrokeDasharray'
	};

	readonly #rules: ShapeRule[];

	/** The fields any rule sets, in either role. */
	readonly #fields: Field[];

	constructor(markers: readonly ({ type: string } & ShapeRule)[]) {
		this.#rules = markers.filter(
			(m): m is { type: 'hover' } & ShapeRule =>
				m.type === 'hover' && !!((m as ShapeRule).active || (m as ShapeRule).others)
		);
		this.#fields = [
			...new Set(
				this.#rules.flatMap((rule) =>
					[rule.active, rule.others].flatMap(
						(style) =>
							Object.entries(style ?? {})
								.filter(([, value]) => value !== undefined)
								.map(([name]) => name) as Field[]
					)
				)
			)
		];
	}

	/** Whether any hover marker restyles shapes. */
	get any(): boolean {
		return this.#rules.length > 0;
	}

	/** Whether `marker`'s shapes take the hover's styles. */
	static links(marker: object): boolean {
		const hover = (marker as { hover?: unknown }).hover;
		return hover === true || hover === 'style';
	}

	/**
	 * `marker` with each style the hover sets as a function of the row: the hovered rows take `active`, the others
	 * `others`, and while nothing is hovered every row its own style. A marker the hover does not style is returned
	 * as it is. `rows` are what the marker draws without `data` of its own.
	 *
	 * The outline `active` sets is not the shape's own: {@link outline} draws it over every shape, whole.
	 */
	styled<T extends object>(marker: T, rows: readonly unknown[], reach: HoverShapesReach): T {
		return this.#styled(marker, rows, reach, false);
	}

	/** {@link styled}, with `active`'s outline on the shapes themselves when `outlined`. */
	#styled<T extends object>(
		marker: T,
		rows: readonly unknown[],
		reach: HoverShapesReach,
		outlined: boolean
	): T {
		if (!this.any || !HoverShapes.links(marker)) return marker;
		const own = { ...(marker as { styles?: Record<string, unknown> }).styles };
		const data = ((marker as { data?: unknown[] }).data ?? rows) as readonly unknown[];
		const isDot = (marker as { type?: string }).type === 'dot';
		const styles = { ...own };
		for (const field of this.#fields) {
			const name = isDot ? HoverShapes.#DOT_KEYS[field] : field;
			const base = HoverShapes.#reader(field, own[name], data);
			styles[name] = (row: Row, index: number) => {
				const value = this.#hovered(field, row, index, reach, outlined);
				return value === undefined ? base(row, index) : value;
			};
		}
		return MarkerStyles.restyle({ ...marker, styles } as T, { cfg: reach.cfg, rows: [...data] });
	}

	/** Whether any rule outlines the hovered shapes: an `active` that sets one of the stroke's fields. */
	get outlines(): boolean {
		return this.#rules.some((rule) => HoverShapes.#outlining(rule));
	}

	/**
	 * The outline of `marker`'s hovered shapes, to draw over every shape of the plot: the marker over its hovered
	 * rows only, with no fill, no label and no pointer of its own. A shape is drawn in its marker's order, so its
	 * neighbours drawn after it would cover part of its outline - a treemap's tile, a heatmap's cell with no gap.
	 * `undefined` when no rule outlines the shapes or nothing of the marker is hovered.
	 */
	outline<T extends object>(
		marker: T,
		rows: readonly unknown[],
		reach: HoverShapesReach
	): T | undefined {
		if (!this.outlines || !HoverShapes.links(marker)) return undefined;
		const rules = this.#rules.filter((rule) => HoverShapes.#outlining(rule));
		const data = (((marker as { data?: unknown[] }).data ?? rows) as Row[]).filter((row) =>
			rules.some(
				(rule) =>
					(rule.series === undefined || row?.[SERIES_KEY] === rule.series) &&
					reach.roleOf(row, rule.series) === 'active'
			)
		);
		if (data.length === 0) return undefined;
		const styled = this.#styled(marker, rows, reach, true) as Record<string, unknown>;
		const isDot = (marker as { type?: string }).type === 'dot';
		const unfilled = isDot
			? { dotFill: 'none', dotFillOpacity: 0 }
			: { fill: 'none', fillOpacity: 0 };
		const rest = Object.fromEntries(
			Object.entries(styled).filter(
				([key]) => key !== 'label' && key !== 'hover' && !key.startsWith('on')
			)
		);
		return {
			...rest,
			data,
			styles: { ...(styled.styles as object), ...unfilled }
		} as T;
	}

	static #outlining(rule: ShapeRule): boolean {
		const active = rule.active ?? {};
		return HoverShapes.#OUTLINE_KEYS.some((key) => active[key] !== undefined);
	}

	/**
	 * What the hover sets `field` to on `row` - the last rule that reaches the row and sets it wins - or `undefined`
	 * when none does: the row is not hovered, or the legend dims it and `field` is the legend's. An outline `active`
	 * sets is left to the outline drawn over every shape, unless `outlined`.
	 */
	#hovered(
		field: Field,
		row: Row,
		index: number,
		reach: HoverShapesReach,
		outlined: boolean
	): unknown {
		let value: unknown;
		let dimmed: boolean | undefined;
		for (const rule of this.#rules) {
			if (rule.series !== undefined && row?.[SERIES_KEY] !== rule.series) continue;
			const role = reach.roleOf(row, rule.series);
			const style = role === 'active' ? rule.active : role === 'other' ? rule.others : undefined;
			const own = style?.[field];
			if (own === undefined) continue;
			if (
				role === 'active' &&
				!outlined &&
				HoverShapes.#OUTLINE_KEYS.includes(field) &&
				HoverShapes.#outlining(rule)
			)
				continue;
			dimmed ??= HoverShapes.#LEGEND_KEYS.has(field) && reach.dimmed(row);
			if (dimmed) return undefined;
			value = typeof own === 'function' ? (own as Read)(row, index) : own;
		}
		return value;
	}

	/** How the shape's own `style` for `field` reads on a row, as the marker would draw it. */
	static #reader(field: Field, style: unknown, rows: readonly unknown[]): Read {
		if (typeof style === 'function') return style as Read;
		// An opacity is a channel of the mark, and svelteplot leaves out a row whose channel reads nothing.
		if (style === undefined && HoverShapes.#OPACITY_KEYS.has(field)) return () => 1;
		if (typeof style !== 'string' || field === 'strokeDasharray') return () => style;
		if (HoverShapes.#COLOR_KEYS.has(field)) {
			const color = RowStyle.colorOf(style, rows);
			return color ? (row) => color(row) : () => style;
		}
		// A number (an opacity, a width) a string names the field of.
		return (row) => row?.[style];
	}
}
