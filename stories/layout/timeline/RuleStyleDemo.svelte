<script lang="ts">
	import { onDestroy } from 'svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import { resetConfiguration, setConfiguration } from '$lib/configuration/config.svelte';
	import { TIME_SERIES } from '../../data/time-series';

	// The rule's look is the configuration's `timeline`: its colors, thickness and gap, and `rule` for the line and the steps.
	setConfiguration({
		timeline: {
			activeColor: '#0f766e',
			axisColor: '#475569',
			thickness: 80,
			rule: {
				fontSize: 11,
				activeFontSize: 28,
				activeFontWeight: 600,
				labelOpacity: 0.9,
				axisWidth: 4,
				axisOpacity: 1
			}
		}
	});
	onDestroy(resetConfiguration);

	const data = TIME_SERIES.filter((d) => d.metric === 'GDP');
	const scales = {
		x: { domain: [2018, 2022] as [number, number] },
		y: { domain: [0, 100] as [number, number] }
	};
</script>

<div style="display: flex; flex-direction: column; gap: 24px;">
	<LinePlot
		width={760}
		height={340}
		title="A styled rule"
		{data}
		x="year"
		y="value"
		color="region"
		{scales}
		timeline={{ accessor: 'year', type: 'rule', filterMode: 'upTo', progress: 0.5 }}
	/>
	<LinePlot
		width={760}
		height={340}
		title="Horizontal"
		{data}
		x="year"
		y="value"
		color="region"
		{scales}
		timeline={{
			accessor: 'year',
			type: 'rule',
			filterMode: 'upTo',
			progress: 0.5,
			orientation: 'horizontal'
		}}
	/>
</div>
