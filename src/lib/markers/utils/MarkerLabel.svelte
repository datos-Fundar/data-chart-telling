<script lang="ts">
	import TextMarker from '$lib/markers/text/TextMarker.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { BoxLabel, type Labelled } from '$lib/markers/utils/BoxLabel';
	import { MARK_EVENTS } from '$lib/types/markers/channels/commonMarkerEvents';
	import type { TextLabelConfig } from '$lib/types/markers/basic/text';

	/**
	 * The `label` of a marker that draws a box per row: a `text` marker anchored in each box and fitted to it. A marker
	 * with a label only has to render `<MarkerLabel {marker} />` after its own shapes. Nothing is drawn without a
	 * `label`, or when the marker does not say where its boxes are.
	 */
	const { marker }: { marker: Labelled & { label?: TextLabelConfig } } = $props();
	const plot = usePlot();
	const cfg = $derived(getConfiguration());

	const labelled = $derived(
		BoxLabel.of(marker, {
			isHorizontal: plot.axes?.isHorizontal,
			gap: cfg.text.label.gap,
			scales: () => plot.svelteplot.scales as never
		})
	);
	/** A label with a handler of its own listens for the pointer; one without leaves it to the shape under it. */
	const listens = $derived(MARK_EVENTS.some((name) => !!marker.label?.[name]));
</script>

{#if labelled}
	<g pointer-events={listens ? undefined : 'none'}>
		<TextMarker marker={labelled.marker} box={labelled.box} />
	</g>
{/if}
