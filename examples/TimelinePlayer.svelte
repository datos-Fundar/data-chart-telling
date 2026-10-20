<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './data';
</script>

<!--
	`timeline` slices the rows by `accessor`. A timeline is a player by default:
	play/pause, the current step and a slider in the chrome. `progress` sets where
	it starts. `type: 'rule'` draws a guide beside the plot with no controls
	instead (see TimelineRule). To build your own widget, read
	`useFigure().timeline` (seek, play, pause, next, ...).
-->
<BarPlot
	width={720}
	height={400}
	data={REGION_VALUES}
	x="region"
	y="value"
	scales={{ y: { domain: [0, 30] } }}
	timeline={{ accessor: 'date', progress: 0.25, player: { autoplay: false, loop: true } }}
/>
