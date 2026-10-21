import { resolveColorScale } from '$lib/utils/color';
import { resolveOpacityScale } from '$lib/utils/opacity';
import { resolveSymbolScale } from '$lib/utils/symbol';
import type { ChannelScalesConfig } from '$lib/types/layout/scales';
import type { SymbolType } from '$lib/types/plots/constants';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

/** One resolved opacity bucket: every row in `data` renders at exactly `value`. */
export type OpacityBucket<TData> = { value: number; data: TData[] };

/**
 * What a marker's own `color`, `symbol` and `opacity` channels resolve to,
 * over its rows, shared by every marker kind that intersects `CommonMarkerConfig`.
 */
export class MarkerChannels {
	/**
	 * The scales a marker with none of its own draws with: the plot's, except
	 * a numeric color `domain` - it spans the plot's own values, so the
	 * marker's own values would all land at one end of it. The scheme (and
	 * pivot) carry over; the domain is read from the marker's own rows.
	 */
	static inheritScales(
		own: ChannelScalesConfig | undefined,
		plot: ChannelScalesConfig | undefined
	): ChannelScalesConfig | undefined {
		if (own || !plot?.color) return own ?? plot;
		const { domain, ...color } = plot.color;
		const numeric = Array.isArray(domain) && domain.every((v) => typeof v === 'number');
		return { ...plot, color: numeric ? color : plot.color };
	}

	/** `markers`, each `dot` with no scales of its own carrying the plot's ({@link inheritScales}). */
	static inheritAll<TMarker extends { type: string; scales?: ChannelScalesConfig }>(
		markers: TMarker[],
		plot: ChannelScalesConfig | undefined
	): TMarker[] {
		return markers.map((marker) =>
			marker.type === 'dot' && !marker.scales
				? { ...marker, scales: MarkerChannels.inheritScales(undefined, plot) }
				: marker
		);
	}

	/**
	 * Resolves a `CommonMarkerConfig` pair into a per-row fill accessor, or
	 * `undefined` when `color` is unset (caller falls back to its own flat
	 * fill/stroke). Shared by every marker kind that intersects `CommonMarkerConfig`.
	 * Safe as a live per-row function - svelteplot recognizes an already-resolved
	 * CSS color string as a literal and never re-scales it (unlike `opacity`/`r`).
	 * Continuous (numeric) or categorical (string) values both work, same as a
	 * plot's own `color` channel - the theme's own 2-color ramp defaults a
	 * continuous value, its discrete `palette` a categorical one.
	 */
	static buildFill<TData>(
		data: TData[],
		color: string | ((d: TData) => unknown) | undefined,
		scales: ChannelScalesConfig | undefined,
		cfg: PlotStylesConfig
	): ((d: TData) => string) | undefined {
		if (!color || !data.length) return undefined;
		const colorFn =
			typeof color === 'function' ? color : (d: TData) => (d as Record<string, unknown>)[color];
		const rawVals = data
			.map((d) => colorFn(d))
			.filter((v) => v != null && !(typeof v === 'number' && !Number.isFinite(v)));
		if (!rawVals.length) return undefined;
		const allNumeric = rawVals.every((v) => Number.isFinite(Number(v)));
		const domain: [number, number] | string[] = allNumeric
			? [Math.min(...rawVals.map(Number)), Math.max(...rawVals.map(Number))]
			: [...new Set(rawVals.map(String))];
		const defaultScheme = allNumeric ? [cfg.continuous.min, cfg.continuous.max] : cfg.palette;
		const colorScale = resolveColorScale(scales?.color, domain, defaultScheme);
		return (d: TData) => colorScale(colorFn(d));
	}

	/**
	 * Resolves a `CommonMarkerConfig`-style `symbol` pair into a per-row shape
	 * accessor, or `undefined` when unset. Safe as a live per-row function for
	 * the same reason `buildFill` is - a resolved shape name is a
	 * recognized literal, not re-scaled.
	 */
	static buildSymbol<TData>(
		data: TData[],
		symbol: string | ((d: TData) => unknown) | undefined,
		scales: ChannelScalesConfig | undefined,
		cfg: PlotStylesConfig
	): ((d: TData) => SymbolType) | undefined {
		if (!symbol) return undefined;
		const symbolFn =
			typeof symbol === 'function' ? symbol : (d: TData) => (d as Record<string, unknown>)[symbol];
		const domain = [
			...new Set(
				data
					.map((d) => symbolFn(d))
					.filter((v) => v != null)
					.map(String)
			)
		];
		if (!domain.length) return undefined;
		const scale = resolveSymbolScale(scales?.symbol, domain, cfg.symbols);
		return (d: TData) => scale(symbolFn(d));
	}

	/**
	 * Resolves a `CommonMarkerConfig`-style `opacity` pair into a list of
	 * opacity buckets, or `undefined` when unset. Unlike `buildFill`,
	 * this can NOT hand back a live per-row function - svelteplot treats
	 * `fillOpacity`/`opacity` as bound to its own shared scale (there's no
	 * "this number is already resolved, don't touch it" escape hatch the way a
	 * recognized CSS color string gets), so any function handed a per-row
	 * accessor gets its domain silently re-derived and re-normalized by
	 * svelteplot itself (verified empirically, not assumed). Bucketing rows by
	 * a quantized opacity value and rendering one mark instance per bucket
	 * (each with `value` as a literal constant) is the only way to land an
	 * exact, independently-resolved value - same technique `fillOpacity`/gap
	 * dimming already use elsewhere in this codebase (e.g. `heatmap/markers.ts`).
	 * `steps` bounds how many buckets (mark instances) a continuous value can
	 * produce - a visually-smooth compromise, not true infinite precision.
	 */
	static buildOpacityBuckets<TData>(
		data: TData[],
		opacity: string | ((d: TData) => unknown) | undefined,
		scales: ChannelScalesConfig | undefined,
		cfg: PlotStylesConfig,
		steps = 32
	): OpacityBucket<TData>[] | undefined {
		if (!opacity || !data.length) return undefined;
		const opacityFn =
			typeof opacity === 'function'
				? opacity
				: (d: TData) => (d as Record<string, unknown>)[opacity];

		const rawVals = data.map((d) => opacityFn(d)).filter((v) => v != null);
		if (!rawVals.length) return undefined;
		const allNumeric = rawVals.every((v) => Number.isFinite(Number(v)));
		const domain: [number, number] | string[] = allNumeric
			? [Math.min(...rawVals.map(Number)), Math.max(...rawVals.map(Number))]
			: [...new Set(rawVals.map(String))];

		const scale = resolveOpacityScale(scales?.opacity, domain, cfg.continuous.opacityRange);

		const buckets = new Map<number, TData[]>();
		for (const d of data) {
			const resolved = scale(opacityFn(d));
			const quantized = Math.round(resolved * steps) / steps;
			if (!buckets.has(quantized)) buckets.set(quantized, []);
			buckets.get(quantized)!.push(d);
		}
		return [...buckets.entries()].map(([value, rows]) => ({ value, data: rows }));
	}
}
