<script lang="ts">
	import TextMarker from '$lib/markers/text/TextMarker.svelte';
	import CurveLabel from '$lib/markers/labels/CurveLabel.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { MarkerLabels } from '$lib/markers/labels/MarkerLabels';
	import { MARK_EVENTS } from '$lib/types/markers/channels/commonMarkerEvents';
	import type { BoxedMarker } from '$lib/types/markers/labels/box';
	import type { MarkerLabelConfig } from '$lib/types/markers/labels/common';

	const { marker }: { marker: BoxedMarker & { label?: MarkerLabelConfig | MarkerLabelConfig[] } } =
		$props();
	const plot = usePlot();
	const cfg = $derived(getConfiguration());

	const labels = $derived(
		MarkerLabels.build(marker, {
			isHorizontal: plot.axes?.isHorizontal,
			gap: cfg.text.label.gap,
			scales: () => plot.svelteplot.scales as never
		})
	);
	const curves = $derived(MarkerLabels.curves(marker));
	// Without a handler of its own, a label leaves the pointer to its shape.
	const listens = (label: (typeof labels)[number]) =>
		MARK_EVENTS.some((name) => !!(label.marker as Record<string, unknown>)[name]);
</script>

{#each labels as label, i (i)}
	<g pointer-events={listens(label) ? undefined : 'none'}>
		<TextMarker marker={label.marker} box={label.box} />
	</g>
{/each}
{#each curves as curve, i (i)}
	<CurveLabel marker={marker as Record<string, unknown>} label={curve.label} shape={curve.shape} />
{/each}
