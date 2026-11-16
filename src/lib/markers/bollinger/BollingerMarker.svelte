<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { BollingerX, BollingerY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { resolveAccessor } from '$lib/utils/accessors';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { BollingerMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'bollinger'` marker - a moving-average band (svelteplot's
	 * `BollingerX`/`BollingerY`, picked from the way the plot runs
	 * (`usePlot().axes`). A `stroke`-independent `fill`-style option
	 * is deliberately not offered - confirmed empirically to have no visible
	 * effect on svelteplot's own line (see `BollingerStatisticOptions`'s own
	 * doc comment). svelteplot draws one line and one band over all its rows, so
	 * with a `grouping` each group is drawn as a mark of its own, in the color
	 * the plot gives that group unless `styles` sets one.
	 */
	let { marker }: { marker: BollingerMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);

	const plot = usePlot();
	const isHorizontal = $derived(marker.isHorizontal ?? plot.axes?.isHorizontal ?? false);
	const BollingerMark = $derived(isHorizontal ? BollingerX : BollingerY);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);

	/** The rows of each group, in the order the groups first appear. */
	const groups = $derived.by(() => {
		if (!marker.grouping) return [{ key: 'all', rows: data }];
		const groupOf = resolveAccessor(marker.grouping as never) as (row: unknown) => unknown;
		const byKey = new SvelteMap<string, typeof data>();
		for (const row of data) {
			const key = String(groupOf(row));
			const rows = byKey.get(key);
			if (rows) rows.push(row);
			else byKey.set(key, [row]);
		}
		return [...byKey].map(([key, rows]) => ({ key, rows }));
	});

	/** What the plot's palette gives a row's group. */
	const groupFill = $derived(MarkerChannels.buildFill(data, marker.grouping, marker.scales, cfg));
	const id = $props.id();
	/** Each group's line and band: a gradient takes its group's color where a stop has none. */
	const painted = $derived(
		groups.map((group, i) => {
			const color = marker.grouping ? groupFill?.(group.rows[0]) : undefined;
			return {
				...group,
				color,
				stroke: Paint.single(marker.styles?.stroke, color, `${id}-${i}-stroke`),
				band: Paint.single(marker.styles?.bandFill, color, `${id}-${i}-band`)
			};
		})
	);
</script>

<GradientDefs paints={painted.flatMap((group) => [group.stroke, group.band])} />
{#each painted as group (group.key)}
	<BollingerMark
		{...events.props}
		data={group.rows}
		x={marker.x}
		y={marker.y}
		n={marker.n}
		k={marker.k}
		stroke={group.stroke.value ?? group.color}
		strokeOpacity={marker.styles?.strokeOpacity}
		fill={group.band.value ?? group.color}
	/>
{/each}
