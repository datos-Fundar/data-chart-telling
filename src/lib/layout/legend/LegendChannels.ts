import { resolveAccessor } from '$lib/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { ChannelName } from '$lib/plots/utils/ChannelName';
import { MarkerKinds } from '$lib/markers/MarkerKinds';
import { ContinuousDomain } from '$lib/utils/ContinuousDomain';
import { resolveColorScale } from '$lib/utils/color';
import { resolveOpacityScale } from '$lib/utils/opacity';
import { resolveSymbolScale } from '$lib/utils/symbol';
import type { SymbolType } from '$lib/types/plots/constants';
import type { OpacityScaleConfig } from '$lib/types/layout/scales';
import type { LegendEntry, LegendPlot, LegendSource } from '$lib/types/layout/legend';

/**
 * What a plot's value channels - `color`, `opacity`, `r` and `symbol` - draw
 * with, as legend entries: the plot's own (a heatmap's cells, a map's
 * features) and every marker's, read the way the marker resolves them.
 */
export class LegendChannels {
	static of(plot: LegendPlot): LegendEntry[] {
		const markers = plot.markers ?? [];
		const taken = new Set((plot.resolvedSeries ?? []).map((s) => s.name));
		return [
			...LegendChannels.#plotColor(plot),
			...LegendChannels.#segmentColors(plot),
			...markers.flatMap((marker) => LegendChannels.#markerColor(marker, taken)),
			...LegendChannels.#plotOpacity(plot),
			...markers.flatMap((marker) => LegendChannels.#markerOpacity(marker, plot)),
			...LegendChannels.#sizeEntries(plot),
			...LegendChannels.#symbolEntries(plot)
		];
	}

	/**
	 * How `dots` draw: filled unless they all draw as rings; in the one color
	 * they share (their fill, or their stroke as rings), if any; in the one
	 * shape they share, unless a `symbol` channel shapes them.
	 */
	static look(dots: LegendSource[]): { filled: boolean; color?: string; symbol?: SymbolType } {
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

	/** What a channel is called on a legend: its field, or the name of the function that computes it. */
	static #title(channel: unknown, property: string): string | undefined {
		return typeof channel === 'string' ? channel : ChannelName.of(channel, property);
	}

	/** `marker`'s rows read through `channel` (a field or a function), without the missing and non-finite ones. */
	static #values(marker: LegendSource, channel: unknown): unknown[] {
		if (channel === undefined || channel === null || typeof channel === 'number') return [];
		const read = resolveAccessor(channel as never) as (row: unknown) => unknown;
		return (marker.data ?? [])
			.map((row) => read(row))
			.filter((v) => v != null && !(typeof v === 'number' && !Number.isFinite(v)));
	}

	/** The color a marker draws in when it has one color, or its series' own. */
	static #colorOf(marker: LegendSource, plot: LegendPlot): string | undefined {
		const own = LegendChannels.look([marker]).color;
		if (own) return own;
		const fill = [marker.fill, marker.stroke].find(
			(v): v is string => typeof v === 'string' && v !== 'none'
		);
		if (fill) return fill;
		const name = marker.series ?? plot.resolvedSeries?.[0]?.name;
		return name !== undefined && name !== 'default' ? plot.colorForSeries?.(name) : undefined;
	}

	/** The ramp a continuous color scale draws with, when its config sets one: a name or colors (a category map is not a ramp). */
	static #ramp(scale: { scheme?: unknown; pivot?: number } | undefined): {
		scheme?: string | string[];
		pivot?: number;
	} {
		const scheme = scale?.scheme;
		const isRamp =
			typeof scheme === 'string' ||
			(Array.isArray(scheme) && scheme.every((c) => typeof c === 'string'));
		return isRamp
			? {
					scheme: scheme as string | string[],
					...(scale?.pivot !== undefined ? { pivot: scale.pivot } : {})
				}
			: {};
	}

	static #scaleEntry(
		title: string | undefined,
		domain: [number, number],
		scale: { scheme?: unknown; pivot?: number } | undefined
	): LegendEntry {
		return {
			type: 'scale',
			channel: 'color',
			...(title ? { title } : {}),
			min: domain[0],
			max: domain[1],
			...LegendChannels.#ramp(scale)
		};
	}

	/** The plot's own continuous color scale: a numeric `color` field, or a `colorDomain` the plot hands over. */
	static #plotColor(plot: LegendPlot): LegendEntry[] {
		const source = plot.channels?.color?.source;
		const scale = plot.scales?.color;
		const domain = plot.colorDomain ?? scale?.domain;
		if (source === undefined && !plot.colorDomain) return [];
		if (!Array.isArray(domain) || domain.length !== 2) return [];
		if (!domain.every((v) => typeof v === 'number' && Number.isFinite(v))) return [];
		return [
			LegendChannels.#scaleEntry(
				typeof source === 'string' ? source : undefined,
				domain as [number, number],
				scale
			)
		];
	}

	/** One continuous ramp per segment that sets its own, over the values of just its own features. */
	static #segmentColors(plot: LegendPlot): LegendEntry[] {
		const source = plot.channels?.color?.source;
		return (plot.colorRamps ?? []).map(({ name, domain, scale }) =>
			LegendChannels.#scaleEntry(
				typeof source === 'string' ? `${source} (${name})` : name,
				domain,
				scale
			)
		);
	}

	/**
	 * A marker's `color` channel: a continuous scale for numbers; for
	 * categories, one item each in the color the marker draws it, unless a
	 * series of the plot already has that name.
	 */
	static #markerColor(marker: LegendSource, taken: Set<string>): LegendEntry[] {
		const values = LegendChannels.#values(marker, marker.color);
		if (values.length === 0) return [];
		const title = LegendChannels.#title(marker.color, 'color');
		const scale = marker.scales?.color;
		if (values.every((v) => Number.isFinite(Number(v)))) {
			const domain = ContinuousDomain.build(scale?.domain, values.map(Number));
			return domain ? [LegendChannels.#scaleEntry(title, domain, scale)] : [];
		}
		const categories = [...new Set(values.map(String))];
		const colorOf = resolveColorScale(scale, categories, getConfiguration().palette);
		const mark = MarkerKinds.of(marker.type)?.legendSymbol;
		return categories
			.filter((name) => !taken.has(name))
			.map((name) => ({ type: 'mark', name, color: colorOf(name), ...(mark ? { mark } : {}) }));
	}

	static #opacityEntry(
		title: string | undefined,
		domain: [number, number],
		scale: OpacityScaleConfig | undefined,
		color: string | undefined
	): LegendEntry[] {
		if (scale?.range !== undefined && !Array.isArray(scale.range)) return [];
		const read = resolveOpacityScale(scale, domain, getConfiguration().continuous.opacityRange);
		return [
			{
				type: 'opacity',
				channel: 'opacity',
				...(title ? { title } : {}),
				min: domain[0],
				max: domain[1],
				opacityMin: read(domain[0]),
				opacityMax: read(domain[1]),
				...(color ? { color } : {})
			}
		];
	}

	/** The plot's own numeric `opacity` channel, over the `opacityDomain` it hands over. */
	static #plotOpacity(plot: LegendPlot): LegendEntry[] {
		if (!plot.opacityDomain) return [];
		const source = plot.channels?.opacity?.source;
		const name = plot.resolvedSeries?.[0]?.name;
		const color =
			name !== undefined && name !== 'default' ? plot.colorForSeries?.(name) : undefined;
		return LegendChannels.#opacityEntry(
			typeof source === 'string' ? source : undefined,
			plot.opacityDomain,
			plot.scales?.opacity,
			color
		);
	}

	/** A marker's numeric `opacity` channel, in the color the marker draws. */
	static #markerOpacity(marker: LegendSource, plot: LegendPlot): LegendEntry[] {
		const values = LegendChannels.#values(marker, marker.opacity);
		if (values.length === 0 || !values.every((v) => Number.isFinite(Number(v)))) return [];
		const scale = marker.scales?.opacity;
		const domain = ContinuousDomain.build(scale?.domain, values.map(Number));
		if (!domain) return [];
		return LegendChannels.#opacityEntry(
			LegendChannels.#title(marker.opacity, 'opacity'),
			domain,
			scale,
			LegendChannels.#colorOf(marker, plot)
		);
	}

	/**
	 * The size scale of the markers that size by a value (`r` as a field or
	 * function), as svelteplot draws it: a square-root scale from 0 to the
	 * largest value onto 0-10 px, unless `scales.r` pins either end. The
	 * markers' own color when they share one, filled unless they all draw as
	 * rings.
	 */
	static #sizeEntries(plot: LegendPlot): LegendEntry[] {
		const sized = (plot.markers ?? []).filter(
			(marker) => marker.r !== undefined && typeof marker.r !== 'number'
		);
		if (sized.length === 0) return [];
		const values = sized.flatMap((marker) =>
			LegendChannels.#values(marker, marker.r).map(Number).filter(Number.isFinite)
		);
		if (values.length === 0) return [];
		const { filled, color, symbol } = LegendChannels.look(sized);
		const source = plot.channels?.r?.source ?? LegendChannels.#title(sized[0].r, 'r');
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
	 * The shapes the markers' `symbol` channel draws each category as, from
	 * `scales.symbol` or the theme's own cycle. Colored and filled as the size
	 * scale is.
	 */
	static #symbolEntries(plot: LegendPlot): LegendEntry[] {
		const shaped = (plot.markers ?? []).filter((marker) => marker.symbol !== undefined);
		if (shaped.length === 0) return [];
		const config = shaped[0].scales?.symbol;
		const domain = (
			config?.domain ??
			shaped.flatMap((marker) => LegendChannels.#values(marker, marker.symbol).map(String))
		).filter((value, i, all) => all.indexOf(value) === i);
		if (domain.length === 0) return [];
		const shapeOf = resolveSymbolScale(config, domain, getConfiguration().symbols);
		const { filled, color } = LegendChannels.look(shaped);
		const source =
			plot.channels?.symbol?.source ?? LegendChannels.#title(shaped[0].symbol, 'symbol');
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
}
