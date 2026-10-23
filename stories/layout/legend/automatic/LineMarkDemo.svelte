<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE } from '$datasets';
</script>

<!-- A line plot's series show as their stroke. -->
<LinePlot
	width={760}
	height={360}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	scales={{ x: { nice: false } }}
/>
