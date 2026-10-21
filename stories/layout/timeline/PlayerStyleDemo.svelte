<script lang="ts">
	import { onDestroy } from 'svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { resetConfiguration, setConfiguration } from '$lib/configuration/config.svelte';
	import { TIME_SERIES } from '../../data/time-series';

	// Every size and color of the player is the configuration's `timeline.player`.
	setConfiguration({
		timeline: {
			player: {
				background: '#0f172a',
				color: '#e2e8f0',
				radius: '999px',
				padding: '0.5rem 1.25rem',
				button: {
					background: '#14b8a6',
					color: '#042f2e',
					hoverBackground: '#5eead4',
					size: '2.5rem'
				},
				track: { height: '6px', color: '#334155', fillColor: '#14b8a6' },
				thumb: { size: '18px', color: '#5eead4' },
				toggle: { activeBackground: '#14b8a6', activeColor: '#042f2e' }
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

<LinePlot
	width={760}
	height={400}
	title="A styled player"
	{data}
	x="year"
	y="value"
	color="region"
	{scales}
	timeline={{
		accessor: 'year',
		type: 'player',
		filterMode: 'upTo',
		player: { controls: ['play', 'value', 'slider', 'speed', 'loop'] }
	}}
/>
