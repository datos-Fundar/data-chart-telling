<script lang="ts">
	import { Density } from 'svelteplot';
	import { SvelteMap } from 'svelte/reactivity';
	import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { DensityMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'density'` marker as one `<Density>` per group — 2D KDE
	 * contour bands. A grouped marker (its `color`, or its `grouping`, which
	 * a plot's own grouping is inherited into) is split here, not through
	 * svelteplot's own `z`: svelteplot would color an accessor stroke with its
	 * own scale, which doesn't match the plot's series colors. Each group gets
	 * its own literal stroke from the same color channel the dots use.
	 * svelteplot's own `Density` puts no class on its rendered group unless
	 * given one, so this wrapper sets `class="density"` for the same
	 * class-based scoping every other marker kind gets from svelteplot itself.
	 */
	let { marker }: { marker: DensityMarkerConfig } = $props();

	const data = $derived(marker.data ?? []);
	const cfg = $derived(getConfiguration());
	const groupKey = $derived(marker.color ?? marker.grouping);
	const channelFill = $derived(resolveChannelFill(data, groupKey, marker.scales, cfg));

	const groups = $derived.by(() => {
		if (groupKey === undefined) return [{ rows: data, stroke: undefined as string | undefined }];
		const valueOf =
			typeof groupKey === 'function'
				? groupKey
				: (d: Record<string, unknown>) => d[groupKey as string];
		const buckets = new SvelteMap<string, Record<string, unknown>[]>();
		for (const row of data) {
			const value = valueOf(row);
			if (value == null) continue;
			const key = String(value);
			const bucket = buckets.get(key);
			if (bucket) bucket.push(row);
			else buckets.set(key, [row]);
		}
		return [...buckets.values()].map((rows) => ({
			rows,
			stroke: channelFill?.(rows[0]) as string | undefined
		}));
	});
</script>

{#each groups as group, i (i)}
	<Density
		data={group.rows}
		class="density"
		x={marker.x}
		y={marker.y}
		weight={marker.weight}
		bandwidth={marker.bandwidth}
		thresholds={marker.thresholds}
		fill={marker.styles?.fill}
		fillOpacity={marker.styles?.fillOpacity}
		stroke={marker.styles?.stroke ?? group.stroke}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
	/>
{/each}
