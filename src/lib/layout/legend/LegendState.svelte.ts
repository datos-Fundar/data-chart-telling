import { getContext, setContext, untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { resolveSymbolScale } from '$lib/utils/symbol';
import { LegendText } from '$lib/layout/legend/LegendText';
import type { SymbolType } from '$lib/types/plots/constants';
import type { SymbolScaleConfig } from '$lib/types/layout/scales';
import type {
	ContinuousLegendSection,
	DiscreteLegendSection,
	LegendDisabledAction,
	LegendEntry,
	LegendExtension,
	LegendItem,
	LegendMark,
	LegendRange,
	LegendSection,
	MarkLegend,
	SizeLegendSection,
	SymbolLegendSection
} from '$lib/types/layout/legend';

const LEGEND_KEY = Symbol('dct-legend');

/** A segment or marker as the legend reads it: whether it names itself, and the colors it draws in. */
type LegendSource = {
	type?: string;
	series?: string;
	data?: unknown[];
	r?: unknown;
	symbol?: unknown;
	scales?: { symbol?: SymbolScaleConfig };
	legend?: MarkLegend;
	fill?: unknown;
	stroke?: unknown;
	styles?: {
		fill?: unknown;
		stroke?: unknown;
		dotFill?: unknown;
		dotStroke?: unknown;
		dotSymbol?: unknown;
		strokeDasharray?: unknown;
	};
};

/**
 * A figure's legend, shared by every plot and legend under it: what the
 * reader turned off - each series' {@link LegendDisabledAction}, and the
 * range a continuous section narrows to - and what the plots draw, as each
 * registers it ({@link register}): its series, their colors and marks, and
 * its continuous scales. From those, {@link sections} reads as a legend of
 * its own, for a figure that sets none.
 */
export class LegendState {
	/** Series name → what turning it off does. A series in here is off. */
	readonly disabled = new SvelteMap<string, LegendDisabledAction>();
	/** The narrowed range of the first interactive continuous section, or `null`. */
	range = $state<LegendRange | null>(null);
	readonly #sources = new SvelteMap<unknown, LegendEntry[]>();

	/** The enclosing figure's legend, or `null` outside one. Call during component init. */
	static current(): LegendState | null {
		return getContext<LegendState | undefined>(LEGEND_KEY) ?? null;
	}

	/** A new legend, shared with everything below. Call during component init. */
	static provide(): LegendState {
		const legend = new LegendState();
		setContext(LEGEND_KEY, legend);
		return legend;
	}

	/** The enclosing figure's legend, or a private one for a legend drawn outside any. Call during component init. */
	static ensure(): LegendState {
		return LegendState.current() ?? new LegendState();
	}

	/** Whether `series` is turned off. */
	isOff(series: string): boolean {
		return this.disabled.has(series);
	}

	/** What turning `series` off does, while it is off. */
	actionOf(series: string): LegendDisabledAction | undefined {
		return this.disabled.get(series);
	}

	turnOff(series: string, action: LegendDisabledAction): void {
		this.disabled.set(series, action);
	}

	turnOn(series: string): void {
		this.disabled.delete(series);
	}

	/** Turns `series` off with `action`, or back on. */
	toggle(series: string, action: LegendDisabledAction): void {
		if (this.isOff(series)) this.turnOn(series);
		else this.turnOff(series, action);
	}

	/** Whether any series is off with `'omit'` - which changes the plot's own rows, not just how they draw. */
	get omits(): boolean {
		return [...this.disabled.values()].some((action) => action.mode === 'omit');
	}

	/** `series` without those turned off with `'omit'`. */
	withoutOmitted<S extends { name: string }>(series: S[]): S[] {
		return series.filter((s) => this.actionOf(s.name)?.mode !== 'omit');
	}

	/**
	 * Records what the plot `source` draws, replacing what it recorded before.
	 * A series or mark that is off keeps its entry, in its place, even when
	 * the plot no longer draws it (an `'omit'`): the legend must still list it
	 * to turn it back on.
	 */
	register(source: unknown, entries: LegendEntry[]): void {
		untrack(() => {
			const known = this.#sources.get(source);
			const next = known ? this.#keepingOff(known, entries) : entries;
			if (known && JSON.stringify(known) === JSON.stringify(next)) return;
			this.#sources.set(source, next);
		});
	}

	/** `entries` in the order `known` had them, with the off series and marks `entries` lacks kept from `known`. */
	#keepingOff(known: LegendEntry[], entries: LegendEntry[]): LegendEntry[] {
		const key = (entry: LegendEntry) =>
			entry.type === 'series' || entry.type === 'mark' ? `${entry.type}:${entry.name}` : undefined;
		const drawn = (entry: LegendEntry) => entries.find((other) => key(other) === key(entry));
		const isKept = (entry: LegendEntry) =>
			key(entry) !== undefined &&
			!drawn(entry) &&
			this.disabled.has((entry as Extract<LegendEntry, { name: string }>).name);
		if (!known.some(isKept)) return entries;
		const ordered = known.flatMap((entry) => {
			const current = isKept(entry) ? entry : drawn(entry);
			return current ? [current] : [];
		});
		return [...ordered, ...entries.filter((entry) => !ordered.includes(entry))];
	}

	unregister(source: unknown): void {
		this.#sources.delete(source);
	}

	/**
	 * Everything the plots draw: series first, then what names itself, then
	 * scales - each once, however many plots (or facet panels) draw it: a
	 * series or mark by its name, a size or symbol scale by its title.
	 */
	get entries(): LegendEntry[] {
		const all = [...this.#sources.values()].flat();
		const keyOf = (entry: LegendEntry) =>
			entry.type === 'series' || entry.type === 'mark'
				? `${entry.type}:${entry.name}`
				: entry.type === 'size' || entry.type === 'symbol'
					? `${entry.type}:${entry.title ?? ''}`
					: undefined;
		const once = (type: LegendEntry['type']) =>
			all.filter(
				(entry, i) =>
					entry.type === type &&
					(keyOf(entry) === undefined ||
						all.findIndex((other) => keyOf(other) === keyOf(entry)) === i)
			);
		return [
			...once('series'),
			...once('mark'),
			...once('scale'),
			...once('size'),
			...once('symbol')
		];
	}

	/**
	 * The legend {@link entries} read as, with `extension` added: one discrete
	 * section of every series and every segment or marker that names itself -
	 * a dot as a circle, a line as its stroke, anything else as a swatch - with
	 * `extension.items` after them; a continuous section per color scale, a
	 * size section per dot size scale and a symbol section per dot shape
	 * scale, each titled by its field name (see `legend.pretty`);
	 * then `extension.sections`. A lone series, with nothing else to tell it
	 * from, shows no discrete section; with other sections beside it, the
	 * discrete one is titled `legend.seriesTitle`.
	 */
	sections(extension?: LegendExtension): LegendSection[] {
		const entries = this.entries;
		const cfg = getConfiguration();
		const format = (title: string) => LegendText.of(title, cfg);
		const items: LegendItem[] = [];
		const ramps: LegendSection[] = [];
		for (const entry of entries) {
			if (entry.type === 'size') {
				const { title, domain, range, color, filled, symbol } = entry;
				ramps.push({
					type: 'size',
					title: title && format(title),
					domain,
					range,
					color,
					filled,
					...(symbol ? { symbol } : {})
				} satisfies SizeLegendSection);
			} else if (entry.type === 'symbol') {
				const { title, items: shapes, color, filled } = entry;
				ramps.push({
					type: 'symbol',
					title: title && format(title),
					items: shapes,
					color,
					filled
				} satisfies SymbolLegendSection);
			} else if (entry.type === 'scale') {
				const { title, min, max, colorMin, colorMax } = entry;
				ramps.push({
					type: 'continuous',
					title: title && format(title),
					min,
					max,
					colorMin,
					colorMax
				} satisfies ContinuousLegendSection);
			} else {
				items.push(LegendState.#itemOf(entry));
			}
		}
		items.push(...(extension?.items ?? []));
		const named = entries.some((entry) => entry.type === 'mark') || !!extension?.items?.length;
		const others = [...ramps, ...(extension?.sections ?? [])];
		const title = cfg.legend.seriesTitle.enabled && others.length > 0;
		const discrete: LegendSection[] =
			items.length > 1 || (named && items.length > 0)
				? [
						{
							type: 'discrete',
							...(title ? { title: cfg.legend.seriesTitle.text } : {}),
							items
						} satisfies DiscreteLegendSection
					]
				: [];
		return [...discrete, ...others];
	}

	/**
	 * The author's own `sections`, each discrete item that names something the
	 * plots draw - a series, or a segment or marker that names itself - in its
	 * color, unless the item sets one. Any other item keeps its own color, or
	 * the palette's in item order.
	 */
	colorize(sections: LegendSection[]): LegendSection[] {
		const colorOf = (name: string) => {
			const entry = this.entries.find(
				(e) => (e.type === 'series' || e.type === 'mark') && e.name === name
			);
			return entry && (entry.type === 'series' || entry.type === 'mark') ? entry.color : undefined;
		};
		return sections.map((section) =>
			section.type !== 'discrete'
				? section
				: {
						...section,
						items: section.items.map((item) => {
							const drawn = item.color ? undefined : colorOf(item.name);
							return drawn ? { ...item, color: drawn } : item;
						})
					}
		);
	}

	/**
	 * What a plot draws, as legend entries: each of its series, by name, in
	 * its color, drawn as the plot's own mark - the first of its markers a
	 * legend can show, as dots in the shape they share - then each of its
	 * segments and markers that names itself (its `legend`), in its own color
	 * and mark, then the scales its dots' `r` and `symbol` channels draw with.
	 */
	static entriesOf(plot: {
		resolvedSeries?: { name: string }[];
		colorForSeries?: (name: string) => string;
		markers?: LegendSource[];
		segments?: Record<string, LegendSource[] | undefined>;
		channels?: { r?: unknown; symbol?: unknown };
		scales?: { r?: { domain?: [number, number]; range?: [number, number] } };
	}): LegendEntry[] {
		const color = (name: string | undefined) =>
			name !== undefined && name !== 'default' ? plot.colorForSeries?.(name) : undefined;
		const mark = plot.markers
			?.map((marker) => LegendState.#MARKS[marker.type ?? ''])
			.find((kind) => kind !== undefined);
		const dots = LegendState.#look(
			(plot.markers ?? []).filter((marker) => marker.type === 'dot' && !marker.legend)
		);
		const series: LegendEntry[] = (plot.resolvedSeries ?? []).map((s) => ({
			type: 'series',
			name: s.name,
			color: color(s.name),
			...(mark ? { mark } : {}),
			...(mark === 'dot' && dots.symbol ? { symbol: dots.symbol } : {}),
			...(mark === 'dot' && !dots.filled ? { filled: false } : {})
		}));
		const segments = Object.entries(plot.segments ?? {}).flatMap(([name, list]) =>
			(list ?? []).flatMap((segment) => LegendState.#markEntry(segment, mark, color(name)))
		);
		const markers = (plot.markers ?? []).flatMap((marker) =>
			LegendState.#markEntry(marker, LegendState.#MARKS[marker.type ?? ''], color(marker.series))
		);
		return [
			...series,
			...segments,
			...markers,
			...LegendState.#sizeEntries(plot),
			...LegendState.#symbolEntries(plot)
		];
	}

	/**
	 * The size scale of the plot's dots that size by a value (`r` as a field
	 * or function), as svelteplot draws it: a square-root scale from 0 to the
	 * largest value onto 0-10 px, unless `scales.r` pins either end. The dots'
	 * own color when they share one, filled unless they all draw as rings.
	 */
	static #sizeEntries(plot: {
		markers?: LegendSource[];
		channels?: { r?: unknown };
		scales?: { r?: { domain?: [number, number]; range?: [number, number] } };
	}): LegendEntry[] {
		const dots = (plot.markers ?? []).filter(
			(marker) => marker.type === 'dot' && marker.r !== undefined && typeof marker.r !== 'number'
		);
		if (dots.length === 0) return [];
		const values = dots.flatMap((marker) => {
			const read = resolveAccessor(marker.r as never) as (row: unknown) => unknown;
			return (marker.data ?? []).map((row) => Number(read(row))).filter(Number.isFinite);
		});
		if (values.length === 0) return [];
		const { filled, color, symbol } = LegendState.#look(dots);
		const source = (plot.channels?.r as { source?: unknown } | undefined)?.source ?? dots[0].r;
		return [
			{
				type: 'size',
				channel: 'r',
				...(typeof source === 'string' ? { title: source } : {}),
				domain: plot.scales?.r?.domain ?? [0, Math.max(...values)],
				range: plot.scales?.r?.range ?? [0, 10],
				...(color ? { color } : {}),
				filled,
				...(symbol ? { symbol } : {})
			}
		];
	}

	/**
	 * The shape scale of the plot's dots that take their shape from a value
	 * (`symbol` as a field or function): each category, in order, next to the
	 * shape the dots draw it as - by `scales.symbol`, else the theme's shape
	 * cycle. Colored and filled as the size scale is.
	 */
	static #symbolEntries(plot: {
		markers?: LegendSource[];
		channels?: { symbol?: unknown };
	}): LegendEntry[] {
		const dots = (plot.markers ?? []).filter(
			(marker) => marker.type === 'dot' && marker.symbol !== undefined
		);
		if (dots.length === 0) return [];
		const config = dots[0].scales?.symbol;
		const categories = (marker: LegendSource) => {
			const read = resolveAccessor(marker.symbol as never) as (row: unknown) => unknown;
			return (marker.data ?? []).map((row) => read(row)).filter((v) => v != null).map(String);
		};
		const domain = (config?.domain ?? dots.flatMap(categories)).filter(
			(value, i, all) => all.indexOf(value) === i
		);
		if (domain.length === 0) return [];
		const shapeOf = resolveSymbolScale(config, domain, getConfiguration().symbols);
		const { filled, color } = LegendState.#look(dots);
		const source = (plot.channels?.symbol as { source?: unknown } | undefined)?.source;
		return [
			{
				type: 'symbol',
				channel: 'symbol',
				...(typeof source === 'string' ? { title: source } : {}),
				items: domain.map((name) => ({ name, symbol: shapeOf(name) })),
				...(color ? { color } : {}),
				filled
			}
		];
	}

	/**
	 * How `dots` draw: filled unless they all draw as rings; in the one color
	 * they share (their fill, or their stroke as rings), if any; in the one
	 * shape they share, unless a `symbol` channel shapes them.
	 */
	static #look(dots: LegendSource[]): { filled: boolean; color?: string; symbol?: SymbolType } {
		const filled = dots.length === 0 || dots.some((dot) => dot.styles?.dotFill !== 'none');
		const shared = <T>(values: unknown[], keep: (value: unknown) => value is T) => {
			const unique = values.filter(keep).filter((value, i, all) => all.indexOf(value) === i);
			return unique.length === 1 && values.every(keep) ? unique[0] : undefined;
		};
		const color = shared(
			dots.map((dot) => (filled ? dot.styles?.dotFill : dot.styles?.dotStroke)),
			(value): value is string => typeof value === 'string' && value !== 'none'
		);
		const symbol = dots.some((dot) => dot.symbol !== undefined)
			? undefined
			: shared(
					dots.map((dot) => dot.styles?.dotSymbol),
					(value): value is SymbolType => typeof value === 'string'
				);
		return { filled, ...(color ? { color } : {}), ...(symbol ? { symbol } : {}) };
	}

	/** A segment's or marker's own entry, when it names itself on the legend. */
	static #markEntry(
		source: LegendSource,
		mark: LegendMark | undefined,
		fallbackColor: string | undefined
	): LegendEntry[] {
		const legend = source.legend;
		if (!legend) return [];
		const own = typeof legend === 'string' ? { label: legend } : legend;
		const styles = source.styles ?? {};
		const drawn = [
			styles.fill,
			styles.stroke,
			styles.dotFill,
			styles.dotStroke,
			source.fill,
			source.stroke
		].find((value): value is string => typeof value === 'string' && value !== 'none');
		const dashed = styles.strokeDasharray !== undefined && styles.strokeDasharray !== 'none';
		const dot = mark === 'dot' ? LegendState.#look([source]) : undefined;
		const symbol = own.symbol ?? dot?.symbol;
		const filled = own.filled ?? dot?.filled;
		return [
			{
				type: 'mark',
				name: own.label,
				label: own.label,
				color: own.color ?? drawn ?? fallbackColor,
				...(mark ? { mark } : {}),
				...(symbol ? { symbol } : {}),
				...(filled === false ? { filled } : {}),
				...(own.lineStyle || dashed ? { lineStyle: own.lineStyle ?? 'dashed' } : {})
			}
		];
	}

	/** A series or mark entry as a discrete legend item. */
	static #itemOf(entry: Extract<LegendEntry, { type: 'series' | 'mark' }>): LegendItem {
		return {
			name: entry.name,
			...(entry.label ? { label: entry.label } : {}),
			color: entry.color,
			...(entry.filled === false ? { filled: false } : {}),
			...(entry.symbol || entry.mark === 'dot'
				? { symbol: entry.symbol ?? 'circle' }
				: entry.mark === 'line'
					? { symbol: 'line' as const, lineStyle: entry.lineStyle ?? 'solid' }
					: {})
		};
	}

	/** How each marker type shows on a legend - a type missing here shows as a swatch. */
	static readonly #MARKS: Record<string, LegendMark | undefined> = {
		line: 'line',
		rule: 'line',
		regression: 'line',
		bollinger: 'line',
		trail: 'line',
		dot: 'dot',
		area: 'area',
		density: 'area',
		hull: 'area',
		difference: 'area',
		bar: 'bar',
		box: 'bar',
		rect: 'rect',
		cell: 'cell'
	};
}
