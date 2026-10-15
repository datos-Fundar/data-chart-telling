<script lang="ts">
	import { useFigure } from '$lib/layout/plot/usePlot';

	// Anything inside a figure, its chrome included, reads and drives its timeline.
	const timeline = useFigure().timeline!;
</script>

<div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0;">
	<button onclick={() => timeline.previous()}>Previous</button>
	<button onclick={() => timeline.toggle()}>{timeline.playing ? 'Pause' : 'Play'}</button>
	<button onclick={() => timeline.next()}>Next</button>
	<strong>{timeline.value}</strong>
	<span>({Math.round(timeline.progress * 100)}%)</span>
</div>
