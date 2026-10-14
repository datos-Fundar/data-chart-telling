<script lang="ts">
	import { ticks } from 'd3-array';
	import type { SizeLegendSection } from '$lib/types/layout/legend';
	import { SymbolPath } from '$lib/utils/symbol';
	import { AxisNumberFormat } from '$lib/layout/legend/AxisNumberFormat';
	import { getConfiguration } from '$lib/configuration/config.svelte';

	/**
	 * A size legend: a row of dots, each the radius one value draws at - its
	 * `domain` onto `range` (px) on a square-root scale, as a plot's `r`
	 * channel sizes its dots - bottom-aligned, with the value under each,
	 * spaced by whichever is wider. Values read as the axes write theirs.
	 * Filled, or drawn as rings, in the section's color.
	 */
	let { section }: { section: SizeLegendSection } = $props();

	const cfg = $derived(getConfiguration());
	const fmt = $derived(section.format ?? AxisNumberFormat.of(section.domain, cfg));
	/** A value's radius: `domain` onto `range` on a square-root scale. */
	function radius(value: number): number {
		const [d0, d1] = section.domain.map(Math.sqrt);
		const [r0, r1] = section.range;
		return r0 + ((r1 - r0) * (Math.sqrt(value) - d0)) / (d1 - d0 || 1);
	}

	/** A few round values across the domain, above zero: at most four. */
	const values = $derived.by(() => {
		if (section.values) return section.values;
		const [lo, hi] = section.domain;
		const round = ticks(lo, hi, 8).filter((v) => v > 0);
		const step = Math.ceil(round.length / 4);
		return round.filter((_, i) => (round.length - 1 - i) % step === 0);
	});

	const dots = $derived(values.map((value) => ({ value, r: Math.max(1, radius(value)) })));
	const maxR = $derived(Math.max(1, ...dots.map((dot) => dot.r)));
	const color = $derived(section.color ?? 'currentColor');
	const filled = $derived(section.filled ?? true);
	const symbol = $derived(section.symbol ?? 'circle');
	const paint = $derived({
		fill: filled ? color : 'none',
		'fill-opacity': filled ? 0.85 : undefined,
		stroke: color,
		'stroke-width': 1
	});
</script>

<div class="dct-size" role="img" aria-label={section.title ?? 'Size'}>
	{#each dots as dot (dot.value)}
		<div class="dct-size__item">
			<svg width={2 * dot.r + 2} height={2 * maxR + 2} style="overflow: visible">
				{#if symbol === 'circle'}
					<circle cx={dot.r + 1} cy={1 + 2 * maxR - dot.r} r={dot.r} {...paint} />
				{:else}
					<path
						d={SymbolPath.of(symbol, dot.r)}
						transform="translate({dot.r + 1},{1 + 2 * maxR - dot.r})"
						{...paint}
					/>
				{/if}
			</svg>
			<span class="dct-size__label">{fmt(dot.value)}</span>
		</div>
	{/each}
</div>

<style>
	.dct-size {
		display: flex;
		align-items: flex-end;
		gap: var(--dct-legend-size-gap, 12px);
	}
	.dct-size__item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
	}
	.dct-size__label {
		font-size: var(--dct-continuous-label-size, 0.875rem);
		line-height: 1.2;
		white-space: nowrap;
	}
</style>
