<script lang="ts">
	import { Geo } from 'svelteplot';
	import { PlotContext } from '$lib/layout/plot/PlotContext';
	import type { GeoFeaturesMarkerConfig } from '$lib/types/markers/geo';

	/** Renders one `'geo'` marker - one resolved-style bucket of the base map's own features, as a single `<Geo>` call. */
	let { marker }: { marker: GeoFeaturesMarkerConfig } = $props();

	const hover = PlotContext.current()?.hover;
	// An `inset` marker's panel has its own hover.
	const overInset = (e: Event) => (e.target as Element | null)?.closest?.('.dct-geo-inset') != null;
	const enter = $derived(
		marker.hover
			? (e: Event, d: Record<string, unknown>) => {
					const row = marker.hover?.get(d.__id as string);
					if (row && !overInset(e)) hover?.onPointer([row as never]);
				}
			: undefined
	);
	const leave = $derived(
		marker.hover
			? (e: Event) => {
					if (!overInset(e)) hover?.onLeave();
				}
			: undefined
	);
</script>

<Geo
	data={marker.data}
	fill={marker.fill}
	fillOpacity={marker.fillOpacity ?? 1}
	stroke={marker.stroke ?? 'currentColor'}
	strokeWidth={marker.strokeWidth ?? 0.5}
	style="vector-effect: non-scaling-stroke"
	onclick={marker.onclick}
	onpointerenter={enter}
	onpointerleave={leave}
/>
