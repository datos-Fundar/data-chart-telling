<script lang="ts">
	import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { paletteColor } from '$lib/utils/color';
	import TooltipCard from '../../../common/TooltipCard.svelte';
	import { AGE_GROUPS, POPULATION_BY_AGE, type AgeRow } from '$datasets';

	const cfg = getConfiguration();
	const DATA = POPULATION_BY_AGE.filter((d) => d.year === 2022);

	// Series are sorted alphabetically inside PyramidPlot ('Female' < 'Male'),
	// which is also what drives left/right placement and colour assignment -
	// kept in lockstep here since `content` only gets the raw rows back, not
	// their resolved side/colour.
	const SERIES_COLORS: Record<string, string> = {
		Female: paletteColor(0, cfg.palette),
		Male: paletteColor(1, cfg.palette)
	};
</script>

{#snippet content({ rows }: { rows: AgeRow[] })}
	{@const ageGroup = rows[0]?.ageGroup}
	{@const entries = rows
		.map((row) => ({
			label: row.sex,
			color: SERIES_COLORS[row.sex],
			value: row.share,
			display: `${row.share.toFixed(1)}%`
		}))
		.sort((a, b) => b.value - a.value)}
	<TooltipCard heading={ageGroup} {entries} footer="Share of total population" />
{/snippet}

<div class="rich-tooltip-demo">
	<PyramidPlot
		width={950}
		height={520}
		data={DATA}
		x="share"
		y="ageGroup"
		color="sex"
		scales={{ y: { domain: AGE_GROUPS } }}
		tooltip={{
			sync: false,
			format: (row) => {
				const { sex, ageGroup, share } = row as AgeRow;
				return `${sex} - ${ageGroup}: ${share.toFixed(1)}%`;
			},
			content
		}}
	/>
</div>
