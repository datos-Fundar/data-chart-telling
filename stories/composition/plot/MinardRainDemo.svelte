<script lang="ts">
	import Scrubber from '../../common/Scrubber.svelte';
	import MinardRain from './MinardRain.svelte';
	import { MINARD_STEP_VALUES } from './minard';

	/** The temperature table on its own: nothing is drawn until the march turns back from Moscow. */
</script>

<Scrubber initial={1}>
	{#snippet children({ progress })}
		<MinardRain
			order={['title', 'subtitle', 'divider', 'plot', 'divider', 'footer']}
			title="The cold on the retreat from Moscow"
			subtitle="Degrees Réaumur, 1812"
			timeline={{ type: 'rule', progress, values: MINARD_STEP_VALUES, orientation: 'horizontal' }}
		/>
	{/snippet}
</Scrubber>
