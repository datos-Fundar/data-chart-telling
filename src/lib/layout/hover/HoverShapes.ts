import { MarkerStyles } from '$lib/phases/markers/MarkerStyles';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import type { HoverShapeStyle } from '$lib/types/markers/common';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

type Row = Record<string, unknown>;
type Role = 'active' | 'other';

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

/** One part of a marker: its rows that the hover styles alike, keyed by how. */
export type HoverShapesPart<T> = { key: string; marker: T };

/**
 * The look the plot's hover markers give the shapes of every marker linked to the hover (`hover: true` or
 * `'style'`): the hovered ones take `active`, the others `others`, each over the shape's own style. A shape
 * the legend dims keeps its own fill and opacities; one the hover cannot reach (hidden, omitted) is untouched.
 */
export class HoverShapes {
	/** What the legend owns on a dimmed shape. */
	static readonly #LEGEND_KEYS = ['fill', 'fillOpacity', 'strokeOpacity'] as const;

	/** A shape style's field as a `dot` marker names it. */
	static readonly #DOT_KEYS: Record<keyof HoverShapeStyle, string> = {
		fill: 'dotFill',
		fillOpacity: 'dotFillOpacity',
		stroke: 'dotStroke',
		strokeWidth: 'dotStrokeWidth',
		strokeOpacity: 'dotStrokeOpacity',
		strokeDasharray: 'dotStrokeDasharray'
	};

	readonly #rules: ShapeRule[];

	constructor(markers: readonly ({ type: string } & ShapeRule)[]) {
		this.#rules = markers.filter(
			(m): m is { type: 'hover' } & ShapeRule =>
				m.type === 'hover' && !!((m as ShapeRule).active || (m as ShapeRule).others)
		);
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
	 * `marker` in parts, each drawing the rows the hover styles alike - the shapes it does not style first, the
	 * hovered ones last, so their outline is on top. A marker the hover does not style is one part, as it is.
	 */
	split<T extends object>(
		marker: T,
		rows: readonly unknown[],
		reach: HoverShapesReach
	): HoverShapesPart<T>[] {
		const whole = [{ key: '', marker }];
		if (!this.any || !HoverShapes.links(marker)) return whole;
		const data = ((marker as { data?: unknown[] }).data ?? rows) as Row[];
		const buckets = new Map<string, Row[]>();
		for (const row of data) {
			const key = this.#signature(row, reach);
			const bucket = buckets.get(key) ?? buckets.set(key, []).get(key)!;
			bucket.push(row);
		}
		if (buckets.size === 1 && buckets.has('')) return whole;
		const plain = (key: string) => !key.includes('a');
		return [...buckets.entries()]
			.sort(([a], [b]) => Number(plain(b)) - Number(plain(a)))
			.map(([key, part]) => ({
				key,
				marker:
					key === '' ? ({ ...marker, data: part } as T) : this.#restyled(marker, part, key, reach)
			}));
	}

	/**
	 * How the hover styles `row`: for each rule, `a` (active), `o` (other) or `-` (not at all), and `~` when the
	 * legend dims it. `''` while no rule styles it.
	 */
	#signature(row: Row, reach: HoverShapesReach): string {
		const own = row[SERIES_KEY];
		const roles = this.#rules.map((rule) => {
			if (rule.series !== undefined && own !== rule.series) return '-';
			const role = reach.roleOf(row, rule.series);
			if (role === 'active') return rule.active ? 'a' : '-';
			if (role === 'other') return rule.others ? 'o' : '-';
			return '-';
		});
		if (roles.every((role) => role === '-')) return '';
		return roles.join('') + (reach.dimmed(row) ? '~' : '');
	}

	/** `marker` over `rows`, with the styles `key` stands for over its own. */
	#restyled<T extends object>(marker: T, rows: Row[], key: string, reach: HoverShapesReach): T {
		const dimmed = key.endsWith('~');
		const styles = this.#rules.reduce<Record<string, unknown>>(
			(merged, rule, i) => {
				const role = key[i];
				const style = role === 'a' ? rule.active : role === 'o' ? rule.others : undefined;
				return {
					...merged,
					...HoverShapes.#named(HoverShapes.#defined(style, dimmed), marker as { type?: string })
				};
			},
			{ ...(marker as { styles?: object }).styles }
		);
		return MarkerStyles.restyle({ ...marker, data: rows, styles } as T, { cfg: reach.cfg, rows });
	}

	/** `style` as `marker` names its fields: a `dot` marker's are its `dot` ones (`dotFill`...). */
	static #named(
		style: Record<string, unknown>,
		marker: { type?: string }
	): Record<string, unknown> {
		if (marker.type !== 'dot') return style;
		const keys = HoverShapes.#DOT_KEYS as Record<string, string>;
		return Object.fromEntries(
			Object.entries(style).map(([name, value]) => [keys[name] ?? name, value])
		);
	}

	/** `style`'s set values, without what the legend owns on a dimmed shape. */
	static #defined(style: HoverShapeStyle | undefined, dimmed: boolean): Record<string, unknown> {
		return Object.fromEntries(
			Object.entries(style ?? {}).filter(
				([name, value]) =>
					value !== undefined &&
					!(dimmed && (HoverShapes.#LEGEND_KEYS as readonly string[]).includes(name))
			)
		);
	}
}
