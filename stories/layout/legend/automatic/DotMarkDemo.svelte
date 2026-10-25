<script lang="ts">
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import { LIFE } from '$datasets';
</script>

<!--
	A scatter plot's series show as its dots do: as circles by default, or in
	the shape its dots share (`dotSymbol`).
-->
<div style="display: flex; flex-direction: column; gap: 24px;">
	<ScatterPlot
		width={760}
		height={360}
		title="Circles"
		data={LIFE}
		x="year"
		y="value"
		color="sex"
	/>
	<ScatterPlot
		width={760}
		height={360}
		title="Diamonds"
		data={LIFE}
		x="year"
		y="value"
		color="sex"
		segments={{ default: [{ styles: { dotSymbol: 'diamond', dotRadius: 5 } }] }}
	/>
</div>
