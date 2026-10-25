<script lang="ts">
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';

	const REGIONS = ['North', 'Center', 'South'];
	const MONTHS = Array.from({ length: 12 }, (_, monthIndex) => Date.UTC(2024, monthIndex, 1));

	// The same months twice: as `Date`s, and as day/month/year strings.
	const rows = MONTHS.flatMap((time, monthIndex) =>
		REGIONS.map((region, regionIndex) => ({
			region,
			date: new Date(time),
			day: `01/${String(monthIndex + 1).padStart(2, '0')}/2024`,
			value: 40 + 4 * monthIndex + 10 * regionIndex
		}))
	);
</script>

<!--
	A timeline steps through numbers, `Date`s or date strings. ISO strings
	('2024-05', '2024-05-01') read on their own; any other format reads through
	`dateFormat`. Date steps read as dates, as precise as they need: here, months.
-->
<div class="demo">
	<BarPlot
		width={760}
		height={320}
		title="Steps from Dates"
		data={rows}
		x="region"
		y="value"
		scales={{ y: { domain: [0, 120] } }}
		timeline={{ accessor: 'date' }}
	/>
	<BarPlot
		width={760}
		height={320}
		title="Steps from DD/MM/YYYY strings"
		data={rows}
		x="region"
		y="value"
		scales={{ y: { domain: [0, 120] } }}
		timeline={{ accessor: 'day', dateFormat: 'DD/MM/YYYY' }}
	/>
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
</style>
