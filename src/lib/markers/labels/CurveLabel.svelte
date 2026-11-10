<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { CurveGeometry } from '$lib/markers/labels/geometry/CurveGeometry';
	import { Box } from '$lib/layout/margins/Box';
	import type { PathLabelConfig, PathShape } from '$lib/types/markers/labels/path';
	import type { BoxScales } from '$lib/types/markers/labels/box';

	/** Writes one `'path'` label along the curves of a marker: its lines, an area's edge or each dot's rim. */
	const {
		marker,
		label,
		shape
	}: {
		marker: Record<string, unknown>;
		label: PathLabelConfig<string, string>;
		shape: Exclude<PathShape, 'box'>;
	} = $props();
	const plot = usePlot();
	const cfg = $derived(getConfiguration());
	const id = $props.id();

	const styles = $derived(label.styles ?? {});
	const curves = $derived(
		CurveGeometry.build(shape, marker, label, {
			scales: plot.svelteplot.scales as unknown as BoxScales,
			gap: cfg.text.label.gap,
			measure: (text) => Box.ofText(text, Number(styles.fontSize ?? 11), cfg).width
		})
	);
	// Centred on its curve, a label is drawn over a halo of the background so the curve does not cross it.
	const halo = $derived((label.side ?? '') === 'on' && styles.stroke === undefined);
	/** A style's value for a curve's row: a function of the row, or the value itself. */
	const of = (value: unknown, row: unknown) =>
		(typeof value === 'function' ? value(row) : value) as string | number | undefined;
</script>

{#each curves as curve, i (i)}
	<path id="{id}-{i}" d={curve.d} fill="none" stroke="none" />
	<text
		dy={curve.dy}
		dominant-baseline={curve.baseline}
		text-anchor={curve.textAnchor}
		fill={String(of(styles.fill, curve.row) ?? curve.fill ?? 'currentColor')}
		fill-opacity={of(styles.fillOpacity, curve.row)}
		font-size={styles.fontSize ?? 11}
		font-weight={of(styles.fontWeight, curve.row)}
		font-style={of(styles.fontStyle, curve.row)}
		stroke={halo ? cfg.background : (of(styles.stroke, curve.row) as string | undefined)}
		stroke-width={halo ? 3 : of(styles.strokeWidth, curve.row)}
		paint-order={halo ? 'stroke' : styles.paintOrder}
		pointer-events="none"
	>
		<textPath href="#{id}-{i}" startOffset={curve.startOffset}>{curve.text}</textPath>
	</text>
{/each}
