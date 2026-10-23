<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import type { ProjectionLike } from '$lib/plots/utils/tiles';
	import MinardMap from './MinardMap.svelte';
	import MinardRain from './MinardRain.svelte';
	import { MINARD_STEP_VALUES, MINARD_LEGEND } from './minard';

	/**
	 * Minard's whole figure: the map of the march and, under it, the table of
	 * temperature, in one `PlotComposer`. One timeline scrubs both - the army
	 * marches on the map, and once it turns back from Moscow the cold line grows
	 * from east to west - and the map reports its projection, so every reading
	 * sits under the place on the map where the army was.
	 */
	let projection = $state<ProjectionLike>();
</script>

<Scrubber initial={1}>
	{#snippet children({ progress })}
		<PlotComposer
			width={900}
			height={760}
			title="Napoleon's March on Moscow (1812)"
			subtitle="Minard's map and its table of temperature, one timeline"
			timeline={{ type: 'rule', progress, values: MINARD_STEP_VALUES, orientation: 'horizontal' }}
			legend={MINARD_LEGEND}
			order={['title', 'subtitle', 'divider', 'legend', 'plot', 'divider', 'footer']}
			layout={{ columns: 1, heights: [3, 1] }}
		>
			{#snippet footer()}
				<span>
					Based on <a
						href="https://en.wikipedia.org/wiki/Charles_Joseph_Minard#The_map_of_Napoleon's_Russian_campaign"
						target="_blank"
						rel="noopener noreferrer">Charles Minard's map</a
					>. Line thickness is proportional to the number of surviving soldiers at each point of the
					march; temperatures are in degrees Réaumur.
				</span>
			{/snippet}
			<MinardMap onProjection={(own) => (projection = own)} />
			<MinardRain {projection} />
		</PlotComposer>
	{/snippet}
</Scrubber>
