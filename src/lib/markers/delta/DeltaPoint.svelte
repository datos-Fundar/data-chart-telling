<script lang="ts" generics="TData extends Record<string, unknown>">
	import { Line } from 'svelteplot';
	import DotMarker from '$lib/markers/dot/DotMarker.svelte';
	import TextMarker from '$lib/markers/text/TextMarker.svelte';
	import { Delta } from '$lib/markers/delta/Delta';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { Series } from '$lib/types/plots/data/common';
	import type { DeltaPointConfig } from '$lib/types/markers/axis/delta';

	/** One delta, at the one position `marker.at` names. See {@link DeltaMarker} for a list of them. */
	let { marker, data = [] }: { marker: DeltaPointConfig; data?: Series<TData>[] } = $props();

	const plot = usePlot();

	const resolved = $derived(Delta.build(marker.axis, data, marker));
	const cfg = $derived(getConfiguration());
	const label = $derived(cfg.delta.text[marker.axis]);
	const lineAnchor = $derived(marker.text?.lineAnchor ?? label.lineAnchor);

	const clampRange = $derived.by((): [number, number] | undefined => {
		const domain = marker.axis === 'x' ? marker.yDomain : marker.xDomain;
		if (!domain || domain.length < 2) return undefined;
		const lo = Number(domain[0]);
		const hi = Number(domain[domain.length - 1]);
		return isNaN(lo) || isNaN(hi) ? undefined : [Math.min(lo, hi), Math.max(lo, hi)];
	});

	function clamp(v: number): number {
		return clampRange ? Math.max(clampRange[0], Math.min(clampRange[1], v)) : v;
	}

	function pt(fixed: number | Date, varying: number) {
		return marker.axis === 'x' ? { x: fixed, y: varying } : { x: varying, y: fixed };
	}

	function textVaryCoord(fromVis: number, toVis: number) {
		return lineAnchor === 'top'
			? Math.max(fromVis, toVis)
			: lineAnchor === 'bottom'
				? Math.min(fromVis, toVis)
				: (fromVis + toVis) / 2;
	}

	// Pre-derive all coordinates as script-level signals so prop getters read safe
	// values during Svelte 5 teardown, before the {#if} guard finishes unmounting.
	const coords = $derived.by(() => {
		if (!resolved) return null;
		const fromVis = clamp(resolved.from ?? 0);
		const toVis = clamp(resolved.to ?? 0);
		const at = marker.at instanceof Date ? new Date(resolved.at ?? 0) : (resolved.at ?? 0);
		return {
			fromPt: pt(at, fromVis),
			toPt: pt(at, toVis),
			textPt: pt(at, textVaryCoord(fromVis, toVis)),
			lineData: [pt(at, fromVis), pt(at, toVis)],
			diff: resolved.diff ?? 0
		};
	});

	/**
	 * The dot of one end: in the delta's own `stroke` when it sets one, else in the color of the series the end
	 * measures - an axis end has none, and takes the dot's default. `dot` wins over both.
	 */
	function dotStyles(target: DeltaPointConfig['from'] | undefined) {
		const color =
			marker.stroke?.stroke ??
			(target?.type === 'series' ? plot.colorForSeries?.(target.series) : undefined);
		return {
			dotRadius: 4,
			dotFill: color,
			dotStroke: color,
			dotStrokeWidth: 2,
			...marker.dot
		};
	}
</script>

{#if coords}
	<Line
		data={coords.lineData}
		x={(p) => p.x}
		y={(p) => p.y}
		stroke={marker.stroke?.stroke ?? 'currentColor'}
		strokeWidth={marker.stroke?.strokeWidth ?? 2}
		strokeOpacity={marker.stroke?.strokeOpacity ?? 0.8}
		strokeDasharray={marker.stroke?.strokeDasharray ?? '6 6'}
		strokeLinecap={marker.stroke?.strokeLinecap ?? 'round'}
	/>
	<DotMarker
		marker={{ type: 'dot', x: coords.fromPt.x, y: coords.fromPt.y, styles: dotStyles(marker.from) }}
	/>
	<DotMarker
		marker={{ type: 'dot', x: coords.toPt.x, y: coords.toPt.y, styles: dotStyles(marker.to) }}
	/>
	<TextMarker
		marker={{
			type: 'text',
			x: coords.textPt.x,
			y: coords.textPt.y,
			text: marker.formatDiff ? marker.formatDiff(coords.diff) : coords.diff,
			decimals: marker.decimals ?? cfg.numbers.decimals ?? 1,
			prefix: marker.prefix,
			suffix: marker.suffix,
			signDisplay: marker.signDisplay,
			styles: {
				fontWeight: 'bold',
				fontSize: 14,
				textAnchor: label.textAnchor,
				fill: marker.stroke?.stroke ?? 'currentColor',
				...marker.text,
				dx: marker.text?.dx ?? label.dx,
				dy: marker.text?.dy ?? label.dy,
				lineAnchor
			}
		}}
	/>
{/if}
