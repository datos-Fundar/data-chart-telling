import { getContext, setContext, untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { MarkerKinds } from '$lib/markers/MarkerKinds';
import { LegendChannels } from '$lib/layout/legend/LegendChannels';
import { LegendText } from '$lib/layout/legend/LegendText';
import type {
	ContinuousLegendSection,
	DiscreteLegendSection,
	LegendDisabledAction,
	LegendChannel,
	LegendEntry,
	LegendExtension,
	LegendItem,
	LegendMark,
	LegendPlot,
	LegendSource,
	LegendRange,
	LegendSection,
	SizeLegendSection,
	SymbolLegendSection
} from '$lib/types/layout/legend';

const LEGEND_KEY = Symbol('dct-legend');

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

	/** Whether `value` lies within `range`; a missing value always does. */
	static inRange(value: number | null | undefined, range: { min: number; max: number }): boolean {
		return value == null || (value >= range.min && value <= range.max);
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
					: entry.type === 'scale' || entry.type === 'opacity'
						? JSON.stringify(entry)
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
			...once('opacity'),
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
		const adjust = (channel: Exclude<LegendChannel, 'series'>, title: string | undefined) =>
			LegendState.#adjustment(extension?.[channel], title, format);
		const items: LegendItem[] = [];
		const ramps: LegendSection[] = [];
		let interactive = false;
		for (const entry of entries) {
			if (entry.type === 'size') {
				const { title, domain, range, color, filled, symbol } = entry;
				ramps.push({
					type: 'size',
					channel: 'r',
					title: title && format(title),
					domain,
					range,
					color,
					filled,
					...(symbol ? { symbol } : {}),
					...adjust('r', title)
				} satisfies SizeLegendSection);
			} else if (entry.type === 'symbol') {
				const { title, items: shapes, color, filled } = entry;
				ramps.push({
					type: 'symbol',
					channel: 'symbol',
					title: title && format(title),
					items: shapes,
					color,
					filled,
					...adjust('symbol', title)
				} satisfies SymbolLegendSection);
			} else if (entry.type === 'opacity') {
				const { title, min, max, opacityMin, opacityMax, color } = entry;
				ramps.push({
					type: 'continuous',
					channel: 'opacity',
					title: title && format(title),
					min,
					max,
					opacity: [opacityMin, opacityMax],
					...(color ? { colorMin: color } : {}),
					...adjust('opacity', title)
				} satisfies ContinuousLegendSection);
			} else if (entry.type === 'scale') {
				const { title, min, max, colorMin, colorMax, scheme, pivot } = entry;
				const section = {
					type: 'continuous',
					channel: 'color',
					title: title && format(title),
					min,
					max,
					colorMin,
					colorMax,
					...(scheme !== undefined ? { scheme } : {}),
					...(pivot !== undefined ? { pivot } : {}),
					...adjust('color', title)
				} satisfies ContinuousLegendSection as ContinuousLegendSection;
				// The legend holds one range, so only the first interactive ramp drives it.
				if (section.interactive?.enabled) {
					if (interactive) section.interactive = { ...section.interactive, enabled: false };
					interactive = true;
				}
				ramps.push(section);
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
							items,
							...LegendState.#adjustment(extension?.color, undefined, format),
							...extension?.series
						} satisfies DiscreteLegendSection
					]
				: [];
		return [...discrete, ...others];
	}

	/** What `override` changes in the section titled `title`: the entries that match it, in order, merged. */
	static #adjustment<T extends object>(
		override: T | (T & { match?: string })[] | undefined,
		title: string | undefined,
		format: (title: string) => string
	): Partial<T> {
		if (!override) return {};
		const list = Array.isArray(override) ? override : [override];
		const merged: Record<string, unknown> = {};
		for (const { match, ...config } of list as (T & { match?: string })[]) {
			const matches =
				match === undefined ||
				(title !== undefined && (match === title || match === format(title)));
			if (matches) Object.assign(merged, config);
		}
		return merged as Partial<T>;
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
	 * and mark, then what the plot's and its markers' `color`, `opacity`, `r`
	 * and `symbol` channels draw with.
	 */
	static entriesOf(plot: LegendPlot): LegendEntry[] {
		const color = (name: string | undefined) =>
			name !== undefined && name !== 'default' ? plot.colorForSeries?.(name) : undefined;
		// A marker that is `legend: false` is decoration - a connector - and does not give the series its symbol.
		const mark = plot.markers
			?.filter((marker) => marker.legend !== false)
			.map((marker) => MarkerKinds.of(marker.type)?.legendSymbol)
			.find((kind) => kind !== undefined);
		const dots = LegendChannels.look(
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
			LegendState.#markEntry(
				marker,
				MarkerKinds.of(marker.type)?.legendSymbol,
				color(marker.series)
			)
		);
		return [...series, ...segments, ...markers, ...LegendChannels.of(plot)];
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
		const dot = mark === 'dot' ? LegendChannels.look([source]) : undefined;
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
}
