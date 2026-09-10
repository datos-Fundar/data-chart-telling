import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { resolveAccessor } from '$lib/plots/utils/accessors';
import { numericMargin } from '$lib/layout/plot/margins';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { MarginConfig } from '$lib/types/plots/props';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';

export type BarSeriesLayout = 'overlap' | 'grouped' | 'stacked';

/**
 * Reactive geometry for BarPlot's series-layout modes — the single source of
 * truth for "where does series N's bar actually sit," shared by bar-segment
 * rendering, value labels, and hover markers. Centralized here after a bug
 * where hover markers reproduced (and initially missed) the same grouped/
 * stacked math value labels already accounted for.
 */
export function createBarLayout<TData extends Record<string, unknown>>(args: {
	scales: () => AxisBasedScalesConfig<TData>;
	isHorizontal: () => boolean;
	width: () => number;
	height: () => number;
	margins: () => MarginConfig | undefined;
	flat: () => TData[];
	xAcc: () => (d: TData) => AxisValue;
	groupedSeries: () => VisualGroup<Series<TData>, BarSegmentStyle>[];
	gapFillMaps: () => Map<string, Map<TData, DiscreteGapFill<BarSegmentStyle>>>;
}) {
	const cfg = $derived(getConfiguration());

	/**
	 * How series sharing the same category are arranged — see
	 * {@link import('$lib/types/layout/scales').AxisScale.seriesLayout}. Read
	 * off `scales.z` since it's the grouping axis, not the category axis itself.
	 */
	const layout = $derived<BarSeriesLayout>(args.scales().z?.seriesLayout ?? 'overlap');

	const categoricalScale = $derived(args.isHorizontal() ? args.scales().y : args.scales().x);
	const valueScale = $derived(args.isHorizontal() ? args.scales().x : args.scales().y);

	/**
	 * Bars default to a 0 baseline. When the value axis's domain is set and
	 * excludes 0 (e.g. `[75, 85]`, to zoom in on a tight range), a literal 0
	 * baseline sits way outside the visible domain — the scale still maps it
	 * linearly, so the bar's "start" lands far past the plot's own edge and
	 * the bar overflows into the margin instead of appearing to end at the
	 * frame. Clamping the baseline to whichever domain bound is closest to 0
	 * makes bars cut off exactly at the visible edge instead, which is the
	 * point of setting a truncated domain in the first place. Left as 0 (no
	 * clamp) when the domain isn't set or already straddles 0 naturally.
	 */
	const valueBaseline = $derived.by(() => {
		const domain = valueScale?.domain;
		if (!domain || domain.length < 2) return 0;
		const lo = Number(domain[0]);
		const hi = Number(domain[domain.length - 1]);
		if (Number.isNaN(lo) || Number.isNaN(hi)) return 0;
		const min = Math.min(lo, hi);
		const max = Math.max(lo, hi);
		if (min > 0) return min;
		if (max < 0) return max;
		return 0;
	});

	/**
	 * Approximate per-category band size in pixels (width for vertical bars,
	 * height for horizontal ones), used only to size each series' slice in
	 * 'grouped' layout via inset props. Derived from this plot's own
	 * `width`/`height`/`margins` rather than svelteplot's actual measured
	 * scale (not part of its public API) — close enough for a grouped look,
	 * though it can be slightly off when an 'auto' margin ends up wider than
	 * the estimate (e.g. unusually long tick labels). Follows the same
	 * band-scale formula (and 0.15 default padding) svelteplot itself uses,
	 * so the category axis's own `paddingInner`/`paddingOuter` — the space
	 * *between* categories — is reflected here too, not just svelteplot's
	 * real render.
	 */
	const estimatedBandwidth = $derived.by(() => {
		const categoryCount = new SvelteSet(args.flat().map((d) => args.xAcc()(d))).size;
		if (categoryCount === 0) return 0;
		const baseMargins = { ...cfg.margins, ...args.margins() };
		const innerSize = args.isHorizontal()
			? Math.max(
					0,
					args.height() -
						numericMargin('top', baseMargins.top) -
						numericMargin('bottom', baseMargins.bottom)
				)
			: Math.max(
					0,
					args.width() -
						numericMargin('left', baseMargins.left) -
						numericMargin('right', baseMargins.right)
				);
		const paddingInner = categoricalScale?.paddingInner ?? categoricalScale?.padding ?? 0.15;
		const paddingOuter = categoricalScale?.paddingOuter ?? categoricalScale?.padding ?? 0.15;
		const step = innerSize / (categoryCount - paddingInner + 2 * paddingOuter);
		return step * (1 - paddingInner);
	});

	const seriesCount = $derived(args.groupedSeries().length);
	// Each series gets an equal slice of the band; `seriesPadding` (0–1, space
	// *within* a group, between its series) reserves a fraction of that slice
	// as a gap split evenly on either side of the bar.
	const seriesStep = $derived(seriesCount > 0 ? estimatedBandwidth / seriesCount : 0);
	const seriesGap = $derived(
		Math.max(0, Math.min(1, args.scales().z?.seriesPadding ?? 0)) * seriesStep
	);

	/**
	 * Per-category cumulative sums for 'stacked' layout — `stackedPrefixSums.get(category)[i]`
	 * is the sum of series `0..i-1`'s value at that category, i.e. series `i`'s
	 * own segment spans `[prefix, prefix + value]`. Computed by hand (rather
	 * than svelteplot's `stackY`/`stackX` transform, which needs every series'
	 * rows in one call to line up cumulative offsets) so the same numbers can
	 * position the bar segment, its middle-anchored label, and its hover marker.
	 */
	const stackedPrefixSums = $derived.by(() => {
		const sums = new SvelteMap<AxisValue, number[]>();
		if (layout !== 'stacked') return sums;
		for (const category of new SvelteSet(args.flat().map((d) => args.xAcc()(d)))) {
			let running = 0;
			const prefix: number[] = [];
			for (const group of args.groupedSeries()) {
				prefix.push(running);
				const seriesXFn = resolveAccessor(group.series.x);
				const seriesYFn = resolveAccessor(group.series.y);
				const row = group.series.data.find((d) => seriesXFn(d) === category);
				if (row) {
					const raw = seriesYFn(row);
					const fill = args.gapFillMaps().get(group.series.name)?.get(row);
					running += fill ? fill.value : isGapValue(raw) ? 0 : Number(raw);
				}
			}
			sums.set(category, prefix);
		}
		return sums;
	});
	function stackedBaseline(category: AxisValue, seriesIndex: number): number {
		return stackedPrefixSums.get(category)?.[seriesIndex] ?? 0;
	}

	/**
	 * Pixel offset for a 'grouped' series' own slice of the category band —
	 * shared by bar segments, value labels, and hover markers. `dy` is
	 * negated for horizontal bars, matching how `insetBottom` positions them.
	 */
	function groupOffset(seriesIndex: number): { dx: number; dy: number } {
		if (layout !== 'grouped') return { dx: 0, dy: 0 };
		const offset = -(estimatedBandwidth / 2) + seriesIndex * seriesStep + seriesStep / 2;
		return args.isHorizontal() ? { dx: 0, dy: -offset } : { dx: offset, dy: 0 };
	}

	return {
		get layout() {
			return layout;
		},
		get valueBaseline() {
			return valueBaseline;
		},
		get estimatedBandwidth() {
			return estimatedBandwidth;
		},
		get seriesCount() {
			return seriesCount;
		},
		get seriesStep() {
			return seriesStep;
		},
		get seriesGap() {
			return seriesGap;
		},
		stackedBaseline,
		groupOffset
	};
}

export type BarLayout<TData extends Record<string, unknown>> = ReturnType<
	typeof createBarLayout<TData>
>;
