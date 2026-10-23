<script lang="ts">
	import Scrubber from '../../common/Scrubber.svelte';
	import MinardMap from './MinardMap.svelte';

	/** The map on its own, with a title, a legend, a caption and a timeline scrubbed from outside. */
</script>

<Scrubber initial={1}>
	{#snippet children({ progress })}
		<MinardMap
			order={['title', 'subtitle', 'divider', 'legend', 'divider', 'plot', 'divider', 'footer']}
			title="Napoleon's March on Moscow (1812)"
			subtitle="Plain svelteplot inside the plots' own chrome"
			timeline={{ type: 'rule', progress, orientation: 'horizontal' }}
		/>
	{/snippet}
</Scrubber>
