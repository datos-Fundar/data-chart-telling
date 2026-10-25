<script lang="ts" generics="TProps extends Record<string, unknown>">
	import { GeoFeatures } from '$lib/plots/map/geo/GeoFeatures.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { LegendState } from '$lib/layout/legend/LegendState.svelte';
	import { ChannelName } from '$lib/plots/utils/ChannelName';
	import { Margins } from '$lib/layout/margins/Margins';
	import BasePlotLayout from '$lib/layout/base/BasePlotLayout.svelte';
	import type { GeoPlotCoreProps } from '$lib/types/plots/map/geo/props';
	import type { CoordinatesConfig } from '$lib/types/layout/coordinates';
	import type { GeoPlotState, GeoPlotCtx } from '$lib/types/plots/map/geo/state';

	/**
	 * A map from GeoJSON or TopoJSON. `segments` styles features by id,
	 * `color` + `scales.color` drive a choropleth ramp, and everything drawn on
	 * top is a `markers` entry.
	 */
	type Props = GeoPlotCoreProps<TProps>;

	let {
		data,
		object,
		featureId,
		color,
		grouping,
		opacity,
		excludeParts,
		width,
		height,
		styles = {},
		segments = {},
		markers = [],
		scales = {},
		coordinates = {},
		margins = $bindable(),
		tooltip = undefined,
		pipeline
	}: Props = $props();

	const cfg = $derived(getConfiguration());

	// ── Resolve data: GeoJSON is synchronous, TopoJSON is converted async ────
	const resolved = new GeoFeatures<TProps>(
		() => data,
		() => object
	);
	const rawFeatures = $derived(resolved.features);

	// ── Tile-layer / projection compatibility ────────────────────────────────
	$effect(() => {
		if (!styles.tileLayer) return;
		const proj = coordinates.projection;
		const name = typeof proj === 'string' ? proj : proj?.type;
		if (name && name !== 'mercator' && name !== 'transverse-mercator') {
			console.warn(
				`GeoPlot: styles.tileLayer only renders correctly with a mercator-family projection - got "${name}". Rendering anyway.`
			);
		}
	});

	/** `coordinates`, with the projection defaulting to `'mercator'` under a tile layer. */
	const resolvedCoordinates = $derived.by(
		(): CoordinatesConfig => ({
			...coordinates,
			projection: coordinates.projection ?? (styles.tileLayer ? 'mercator' : undefined)
		})
	);

	// ── Legend-driven range filter (mirrors HeatmapPlot's own) ────────────────
	const legendInteraction = $derived(LegendState.current());
	const range = $derived(legendInteraction?.range);

	/** `scales` plus the fixed lon/lat frame every projection renders against. */
	const layoutScales = $derived({
		...scales,
		x: { domain: [-180, 180] },
		y: { domain: [90, -90] }
	});

	const ctx = $derived<GeoPlotCtx<TProps>>({
		cfg,
		range,
		fill: styles.fill,
		fillOpacity: styles.fillOpacity,
		stroke: styles.stroke,
		strokeWidth: styles.strokeWidth,
		onFeatureClick: styles.onFeatureClick
	});
	// The kind's pipeline, built once by its plot, over the state this core seeds.
	const plotState = $derived(
		pipeline!.run(
			{
				rawFeatures,
				featureId,
				color,
				grouping,
				opacity,
				excludeParts,
				segments,
				scales,
				authoredMarkers: markers,
				tooltip,
				width,
				height,
				margins
			},
			ctx
		) as GeoPlotState<TProps>
	);

	const allFeatures = $derived(plotState.allFeatures!);
	const features = $derived(plotState.features!);

	/** `styles`, with the drawn features handed to the tile layer for its fit. */
	const resolvedStyles = $derived(
		styles.tileLayer ? { ...styles, tileLayer: { ...styles.tileLayer, features } } : styles
	);

	// The features match the pointer themselves, while the plot's hover is active.
	const markersOut = $derived(
		(plotState.markers ?? []).map((m) =>
			m.type === 'geo' && !plotState.hover!.active ? { ...m, hover: undefined } : m
		)
	);

	/** What `BasePlotLayout` draws from: the features, where each sits, the hover config and scales. */
	const layoutState = $derived({
		hover: plotState.hover,
		hoverPosition: plotState.hoverPosition,
		hoverRows: plotState.hoverRows,
		markers: markersOut,
		scales: layoutScales,
		channels: {
			color: { source: ChannelName.of(color, 'color') },
			opacity: { source: ChannelName.of(opacity, 'opacity') }
		},
		colorDomain: plotState.colorDomain,
		colorRamps: plotState.colorRamps,
		opacityDomain: plotState.opacityDomain,
		styles: resolvedStyles,
		marginEstimate: Margins.GEO_ESTIMATE
	});
</script>

<!-- `layoutScales` pins x/y to the lon/lat range, which `contour` markers read. -->
<BasePlotLayout
	{width}
	{height}
	state={layoutState}
	coordinates={resolvedCoordinates}
	bind:margins
	geoAllFeatures={allFeatures}
/>
