<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import PlotPanel from '$lib/layout/composer/PlotPanel.svelte';
	import Placeholder from './Placeholder.svelte';
</script>

<PlotComposer width={720} height={400} layout={{ columns: 1, heights: [1, 2] }}>
	<PlotPanel>
		{#snippet children({ width, height })}
			<Placeholder label="top" {width} {height} />
		{/snippet}
	</PlotPanel>
	<PlotPanel>
		{#snippet children({ width, height })}
			<PlotComposer {width} {height} layout={{ columns: 2 }}>
				<PlotPanel>
					{#snippet children({ width, height })}
						<Placeholder label="bottom left" {width} {height} />
					{/snippet}
				</PlotPanel>
				<PlotPanel>
					{#snippet children({ width, height })}
						<Placeholder label="bottom right" {width} {height} />
					{/snippet}
				</PlotPanel>
			</PlotComposer>
		{/snippet}
	</PlotPanel>
</PlotComposer>
