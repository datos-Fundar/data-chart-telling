<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import type { LegendSection } from '$lib/types/layout/legend';
	import type { ComposerLayout, ComposerTags } from '$lib/types/layout/composer';

	type Row = { region: string; metric: string; year: number; value: number };

	let {
		legend,
		tags,
		layout = { columns: 2 },
		sync = false,
		progress,
		titled = false
	}: {
		legend?: LegendSection[];
		tags?: ComposerTags;
		layout?: ComposerLayout;
		sync?: boolean;
		progress?: number;
		titled?: boolean;
	} = $props();

	const DATA: Row[] = ['North', 'South'].flatMap((region, r) =>
		['GDP', 'Employment'].flatMap((metric, m) =>
			[2018, 2019, 2020].map((year, j) => ({
				region,
				metric,
				year,
				value: 10 + r * 20 + m * 5 + j
			}))
		)
	);
</script>

<PlotComposer
	width={800}
	height={400}
	title="Composed"
	{legend}
	{tags}
	{layout}
	hover={{ sync }}
	timeline={progress === undefined ? undefined : { progress, values: [2018, 2019, 2020] }}
>
	{#each ['North', 'South'] as region (region)}
		<LinePlot
			area={layout.areas ? region.toLowerCase() : undefined}
			title={titled ? region : undefined}
			data={DATA.filter((d) => d.region === region)}
			x="year"
			y="value"
			color="metric"
			tooltip
			timeline={progress === undefined ? undefined : { accessor: 'year', filterMode: 'exact' }}
		/>
	{/each}
</PlotComposer>
