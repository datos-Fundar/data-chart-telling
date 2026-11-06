<script lang="ts">
	import { getConfiguration, configToCssVars, cssVarsRule } from '$lib/configuration/config.svelte';

	/**
	 * The configuration's `--dct-*` custom properties, as one rule on the document root rather than on each element
	 * that reads them: an author's own rule - on a wrapping element too - overrides them.
	 */
	const rule = $derived(cssVarsRule(configToCssVars(getConfiguration())));
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<style data-dct-config>${rule}</style>`}
</svelte:head>
