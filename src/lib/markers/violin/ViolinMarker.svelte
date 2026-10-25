<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { resolveAccessor } from '$lib/utils/accessors';
	import { ViolinProfiles } from '$lib/markers/violin/ViolinProfiles';
	import type { ViolinMarkerConfig } from '$lib/types/markers/common';
	import type { ProcessedRow } from '$lib/types/phases';

	/**
	 * Renders one `'violin'` marker: for each category of its rows, the density
	 * curve mirrored around the middle of the category's band, or of the share of
	 * it the marker's `slot` takes. The curve is drawn on the plot's own scales;
	 * the plot's axes say which of `x`/`y` holds the category.
	 */
	let { marker }: { marker: ViolinMarkerConfig } = $props();

	const plot = usePlot();
	const cfg = $derived(getConfiguration());
	const isHorizontal = $derived(plot.axes?.isHorizontal ?? false);
	const categoryScale = $derived(
		isHorizontal ? plot.svelteplot.scales.y : plot.svelteplot.scales.x
	);
	const valueScale = $derived(isHorizontal ? plot.svelteplot.scales.x : plot.svelteplot.scales.y);

	const data = $derived((marker.data ?? []) as ProcessedRow[]);
	const profiles = $derived(
		ViolinProfiles.of(
			data,
			{
				category: resolveAccessor((isHorizontal ? marker.y : marker.x) as never),
				value: resolveAccessor((isHorizontal ? marker.x : marker.y) as never)
			},
			{ kernel: marker.kernel, bandwidth: marker.bandwidth, trim: marker.trim }
		)
	);

	const slotIndex = $derived(marker.slot?.index ?? 0);
	const slotCount = $derived(marker.slot?.count ?? 1);
	const bandwidth = $derived(categoryScale?.type === 'band' ? categoryScale.fn.bandwidth() : 0);
	const share = $derived(bandwidth / slotCount);

	/** The pixel point at `along` the value axis and `across` the category axis. */
	const point = (across: number, along: number): [number, number] =>
		isHorizontal ? [along, across] : [across, along];
	const at = (value: number) => Number(valueScale?.fn?.(value as never));

	const shapes = $derived.by(() => {
		if (categoryScale?.type !== 'band' || !valueScale?.fn) return [];
		return profiles.flatMap((profile) => {
			const start = Number(categoryScale.fn(profile.category as never));
			if (!Number.isFinite(start)) return [];
			const center = start + share * slotIndex + share / 2;
			const full = marker.peak ?? Math.max(...profile.curve.map((p) => p.density));
			const half = (density: number) => (full > 0 ? (density / full) * (share / 2) : 0);
			const side = (sign: 1 | -1) =>
				profile.curve.map((p) => point(center + sign * half(p.density), at(p.value)));
			const outline = [...side(-1), ...side(1).reverse()];
			return [outline.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join('') + 'Z'];
		});
	});
</script>

<g class="dct-violin">
	{#each shapes as d, i (i)}
		<path
			{d}
			fill={marker.styles?.fill}
			fill-opacity={marker.styles?.fillOpacity ?? cfg.violin.fillOpacity}
			stroke={marker.styles?.stroke}
			stroke-width={marker.styles?.strokeWidth}
			stroke-opacity={marker.styles?.strokeOpacity}
			stroke-dasharray={marker.styles?.strokeDasharray}
		/>
	{/each}
</g>
