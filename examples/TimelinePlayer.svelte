<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { ROWS } from './data';
</script>

<!--
	`timeline` slices the rows by `accessor`. A timeline is a player by default:
	play/pause, the current step and a slider in the chrome. `type: 'rule'`
	draws a guide beside the plot with no controls instead. To build your own
	widget, read `useFigure().timeline` (seek, play, pause, next, ...).
-->
<BarPlot
	width={720}
	height={400}
	data={ROWS}
	x="region"
	y="value"
	scales={{ y: { domain: [0, 200] } }}
	timeline={{ accessor: 'year', player: { autoplay: false, loop: true } }}
/>
