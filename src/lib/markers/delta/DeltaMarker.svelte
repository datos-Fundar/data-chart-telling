<script lang="ts" generics="TData extends Record<string, unknown>">
	import DeltaPoint from '$lib/markers/delta/DeltaPoint.svelte';
	import { Delta } from '$lib/markers/delta/Delta';
	import type { Series } from '$lib/types/plots/data/common';
	import type { DeltaMarkerConfig } from '$lib/types/markers/axis/delta';

	/**
	 * A delta annotation: one at `marker.at`, or, when it is a list, one at each position - all with the
	 * same ends. `line`, `text` and `dot` can be functions of the position.
	 */
	let { marker, data = [] }: { marker: DeltaMarkerConfig; data?: Series<TData>[] } = $props();

	const points = $derived(Delta.points(marker));
</script>

{#each points as point (String(point.at))}
	<DeltaPoint marker={point} {data} />
{/each}
