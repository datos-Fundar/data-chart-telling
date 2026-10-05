<script lang="ts" generics="TData extends Record<string, unknown>">
	import { Line } from 'svelteplot';
	import DotMarker from './DotMarker.svelte';
	import TextMarker from './TextMarker.svelte';
	import { resolveXDeltas, resolveYDeltas } from '$lib/utils/delta';
	import type { Series } from '$lib/types/plots/data/common';
	import type { DeltaMarkerConfig } from '$lib/types/markers/axis/delta';

	let { marker, data = [] }: { marker: DeltaMarkerConfig; data?: Series<TData>[] } = $props();

	const resolved = $derived.by(() => {
		const [d] =
			marker.axis === 'x' ? resolveXDeltas(data, [marker]) : resolveYDeltas(data, [marker]);
		return d;
	});

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

	function pt(fixed: number, varying: number) {
		return marker.axis === 'x' ? { x: fixed, y: varying } : { x: varying, y: fixed };
	}

	function textVaryCoord(fromVis: number, toVis: number) {
		const anchor = marker.text?.lineAnchor ?? 'middle';
		return anchor === 'top'
			? Math.max(fromVis, toVis)
			: anchor === 'bottom'
				? Math.min(fromVis, toVis)
				: (fromVis + toVis) / 2;
	}

	// Pre-derive all coordinates as script-level signals so prop getters read safe
	// values during Svelte 5 teardown, before the {#if} guard finishes unmounting.
	const coords = $derived.by(() => {
		if (!resolved) return null;
		const fromVis = clamp(resolved.from ?? 0);
		const toVis = clamp(resolved.to ?? 0);
		const at = resolved.at ?? 0;
		return {
			fromPt: pt(at, fromVis),
			toPt: pt(at, toVis),
			textPt: pt(at, textVaryCoord(fromVis, toVis)),
			lineData: [pt(at, fromVis), pt(at, toVis)],
			diff: resolved.diff ?? 0
		};
	});

	const dotStyles = $derived({
		dotRadius: 4,
		dotFill: marker.line?.stroke,
		dotStroke: marker.line?.stroke,
		dotStrokeWidth: 2,
		...marker.dot
	});
</script>

{#if coords}
	<Line
		data={coords.lineData}
		x={(p) => p.x}
		y={(p) => p.y}
		stroke={marker.line?.stroke ?? 'currentColor'}
		strokeWidth={marker.line?.strokeWidth ?? 2}
		strokeOpacity={marker.line?.strokeOpacity ?? 0.8}
		strokeDasharray={marker.line?.strokeDasharray ?? '6 6'}
		strokeLinecap={marker.line?.strokeLinecap ?? 'round'}
	/>
	<DotMarker marker={{ type: 'dot', x: coords.fromPt.x, y: coords.fromPt.y, styles: dotStyles }} />
	<DotMarker marker={{ type: 'dot', x: coords.toPt.x, y: coords.toPt.y, styles: dotStyles }} />
	<TextMarker
		marker={{
			type: 'text',
			x: coords.textPt.x,
			y: coords.textPt.y,
			text: (marker.formatDiff ?? ((v: number) => v.toFixed(1)))(coords.diff),
			styles: {
				fontWeight: 'bold',
				fontSize: 14,
				textAnchor: 'middle',
				fill: marker.line?.stroke ?? 'currentColor',
				...marker.text,
				dx: marker.text?.dx ?? (marker.axis === 'x' ? 12 : 0),
				dy: marker.text?.dy ?? (marker.axis === 'x' ? 0 : -10),
				lineAnchor: marker.axis === 'x' ? (marker.text?.lineAnchor ?? 'middle') : 'bottom'
			}
		}}
	/>
{/if}
