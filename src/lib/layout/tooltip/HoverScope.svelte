<script lang="ts">
	import { provideHoverScope } from '$lib/layout/tooltip/hoverScope';
	import type { Snippet } from 'svelte';

	/** Gives every plot rendered inside its own hover-source id - see {@link provideHoverScope}. */
	let { id, children }: { id: string; children: Snippet } = $props();

	provideHoverScope(() => id);
</script>

{@render children()}
