import { resolveColorScale } from '$lib/utils/color';
import { resolveOpacityScale } from '$lib/utils/opacity';
import { ContinuousDomain } from '$lib/utils/ContinuousDomain';
import { resolveFeatureScales } from '$lib/plots/utils/geoSegments';
import type { GeoPlotState, GeoPlotCtx } from '$lib/types/plots/geo/state';
import type { GeoFeature } from '$lib/types/plots/data/geo';

/**
 * GeoPlot's "scales" phase: each feature's own resolved color (mirrors
 * HeatmapPlot's own), with a per-feature override for whichever segment
 * (its `grouping` bucket, or itself by id) sets its own `scales.color` -
 * see `resolveFeatureScales`. A segment ramp's domain is built from just
 * the features that share its own key, so e.g. two grouping buckets each
 * get a ramp scaled to their own value range, not the whole dataset's.
 */
export function buildScales<TProps extends Record<string, unknown>>(
	state: GeoPlotState<TProps>,
	ctx: GeoPlotCtx<TProps>
): GeoPlotState<TProps> {
	const { scales, features, color, grouping, opacity, segments } = state;
	const { range, cfg } = ctx;

	const colorValues = color
		? features!.map((f) => color(f)).filter((v): v is number => v != null)
		: [];
	const valueDomain = ContinuousDomain.build(scales.color?.domain, colorValues);
	const effectiveDomain = valueDomain ? ContinuousDomain.ramp(valueDomain, range) : null;

	const colorScale = effectiveDomain
		? resolveColorScale({ ...scales.color, domain: effectiveDomain }, effectiveDomain, [
				cfg.continuous.min,
				cfg.continuous.max
			])
		: null;

	// Per-segment-key ramp cache - built lazily, once per distinct grouping
	// value/feature id that actually has its own `scales.color`.
	const segmentScaleCache = new Map<string, ((v: number) => string) | null>();
	const colorRamps: NonNullable<GeoPlotState<TProps>['colorRamps']> = [];

	function segmentColorScaleFor(
		key: string,
		segScales: ReturnType<typeof resolveFeatureScales>
	): ((v: number) => string) | null {
		if (segmentScaleCache.has(key)) return segmentScaleCache.get(key)!;
		const peers = grouping
			? features!.filter((g) => grouping(g) === key)
			: features!.filter((g) => (g as GeoFeature<TProps> & { __id?: string }).__id === key);
		const vals = peers.map((g) => color?.(g)).filter((v): v is number => v != null);
		const scale = vals.length
			? resolveColorScale(
					{ ...segScales?.color, domain: [Math.min(...vals), Math.max(...vals)] },
					[Math.min(...vals), Math.max(...vals)],
					[cfg.continuous.min, cfg.continuous.max]
				)
			: null;
		segmentScaleCache.set(key, scale);
		if (vals.length && segScales?.color) {
			colorRamps.push({
				name: key,
				domain: [Math.min(...vals), Math.max(...vals)],
				scale: segScales.color
			});
		}
		return scale;
	}

	const resolveColor = colorScale
		? (f: GeoFeature<TProps>) => {
				const v = color?.(f);
				if (v == null) return undefined;
				const groupingValue = grouping?.(f);
				const featureId = (f as GeoFeature<TProps> & { __id?: string }).__id ?? '';
				const segScales = resolveFeatureScales(segments, featureId, groupingValue);
				if (segScales?.color) {
					const scale = segmentColorScaleFor(groupingValue ?? featureId, segScales);
					if (scale) return scale(v);
				}
				return colorScale ? colorScale(v) : undefined;
			}
		: undefined;

	// Every segment ramp is built up front, so the legend can draw each one.
	if (colorScale) {
		for (const f of features!) {
			const featureId = (f as GeoFeature<TProps> & { __id?: string }).__id ?? '';
			const groupingValue = grouping?.(f);
			const segScales = resolveFeatureScales(segments, featureId, groupingValue);
			if (segScales?.color) segmentColorScaleFor(groupingValue ?? featureId, segScales);
		}
	}

	// Plot-level only - no segment-scoped opacity ramp (unlike `resolveColor`
	// above), since there's no concrete use case yet driving that complexity.
	const opacityDomain: [number, number] | string[] | null = (() => {
		if (!opacity) return null;
		const vals = features!.map((f) => opacity(f)).filter((v): v is number => v != null);
		return vals.length ? [Math.min(...vals), Math.max(...vals)] : null;
	})();
	const opacityScale = opacityDomain
		? resolveOpacityScale(scales.opacity, opacityDomain, cfg.continuous.opacityRange)
		: null;
	const resolveOpacity = opacityScale
		? (f: GeoFeature<TProps>) => {
				const v = opacity?.(f);
				return v != null ? opacityScale(v) : undefined;
			}
		: undefined;

	return {
		...state,
		colorDomain: valueDomain ?? undefined,
		colorRamps: colorRamps.length ? colorRamps : undefined,
		opacityDomain:
			opacityDomain && typeof opacityDomain[0] === 'number'
				? (opacityDomain as [number, number])
				: undefined,
		resolveColor,
		resolveOpacity
	};
}
