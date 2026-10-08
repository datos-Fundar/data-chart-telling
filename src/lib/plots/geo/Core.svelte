<script lang="ts" generics="TProps extends Record<string, unknown>">
	import { SvelteMap } from 'svelte/reactivity';
	import { createGeoFeatures } from '$lib/plots/geo/features.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { GEO_MARGIN_ESTIMATE } from '$lib/layout/coordinates/margins';
	import { buildData } from '$lib/plots/geo/phases/data';
	import { buildScales } from '$lib/plots/geo/phases/scales';
	import { buildMarkers } from '$lib/plots/geo/phases/markers';
	import { buildTooltip } from '$lib/plots/geo/phases/tooltip';
	import { attachFeatureHover } from '$lib/plots/geo/attachFeatureHover';
	import { runStages } from '$lib/layout/phases/stages';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import { hasHoverMarker } from '$lib/layout/tooltip/utils';
	import BasePlotLayout from '$lib/layout/base/BasePlotLayout.svelte';
	import type { GeoPlotCoreProps } from '$lib/types/plots/geo/props';
	import type { CoordinatesConfig } from '$lib/types/layout/coordinates';
	import type { GeoPlotState, GeoPlotCtx, TaggedGeoFeature } from '$lib/types/plots/geo/state';
	import type { PhaseStage } from '$lib/types/layout/phases';
	import type { HoverConfig } from '$lib/types/plots/props';

	/**
	 * A map from GeoJSON or TopoJSON. `segments` styles features by id,
	 * `color` + `scales.color` drive a choropleth ramp, and everything drawn on
	 * top is a `markers` entry.
	 */
	type TaggedFeature = TaggedGeoFeature<TProps>;

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
		tooltip = undefined
	}: Props = $props();

	const cfg = $derived(getConfiguration());

	// ── Resolve data: GeoJSON is synchronous, TopoJSON is converted async ────
	const resolved = createGeoFeatures<TProps>(
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
	const legendInteraction = $derived(getLegendInteraction());
	const range = $derived(legendInteraction?.continuousRange);

	/** `scales` plus the fixed lon/lat frame every projection renders against. */
	const layoutScales = $derived({
		...scales,
		x: { domain: [-180, 180] },
		y: { domain: [90, -90] }
	});

	// The plot's own pipeline, run once via `runStages`.
	const stages: PhaseStage<GeoPlotState<TProps>, GeoPlotCtx<TProps>>[] = [
		{ phase: 'data', run: buildData },
		{ phase: 'scales', run: buildScales },
		{ phase: 'markers', run: buildMarkers },
		{ phase: 'tooltip', run: buildTooltip }
	];
	const ctx = $derived<GeoPlotCtx<TProps>>({
		cfg,
		range,
		fill: styles.fill,
		fillOpacity: styles.fillOpacity,
		stroke: styles.stroke,
		strokeWidth: styles.strokeWidth,
		onFeatureClick: styles.onFeatureClick
	});
	const plotState = $derived(
		runStages<GeoPlotState<TProps>, GeoPlotCtx<TProps>>(
			stages,
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
				width,
				height,
				margins
			},
			ctx
		)
	);

	const allFeatures = $derived(plotState.allFeatures!);
	const features = $derived(plotState.features!);

	/** `styles`, with the drawn features handed to the tile layer for its fit. */
	const resolvedStyles = $derived(
		styles.tileLayer ? { ...styles, tileLayer: { ...styles.tileLayer, features } } : styles
	);

	// A feature outside the active range is dimmed in place, but never
	// surfaces in hover/tooltip - it's simply absent from the candidate list.
	const hoverPoints = $derived(
		features
			.filter((f) => {
				if (range == null || !color) return true;
				const v = color(f);
				return v == null || (v >= range.min && v <= range.max);
			})
			.map((f) => ({ x: f.__cx, y: f.__cy, row: f, label: f.__id }))
	);
	const hoverGetX = (f: TaggedFeature) => f.__cx;
	const hoverGetY = (f: TaggedFeature) => f.__cy;

	/** `hoverPoints` keyed by feature `__id`. */
	const hoverPointById = $derived.by(() => {
		const map = new SvelteMap<string, (typeof hoverPoints)[number]>();
		for (const p of hoverPoints) map.set(p.row.__id, p);
		return map;
	});

	const hoverActive = $derived(tooltip != null || hasHoverMarker(markers));

	const hover = $derived({
		active: hoverActive,
		points: hoverPoints,
		label: (f: TaggedFeature) => f.__id,
		strategy: 'punctual' as const,
		// A map has no axis to draw a crosshair rule against - 'punctual' here
		// only means "exact XY hover match", unlike heatmap's own use of it.
		crosshair: false,
		sync: tooltip?.sync ?? false,
		tooltip: (tooltip && {
			...tooltip,
			format: tooltip.format ?? plotState.tooltipFormat!
		}) as HoverConfig<TaggedFeature>['tooltip'],
		exclude: isOverInset,
		// Match the feature under the cursor, not the nearest centroid.
		pointMatching: 'contains' as const
	});

	/** Whether a pointer event is over an `inset` marker's panel, which has its own hover. */
	function isOverInset(e: PointerEvent): boolean {
		return (e.target as Element | null)?.closest?.('.dct-geo-inset') != null;
	}

	// Created once, not `$derived`.
	const hoverController = createPlotHover<TaggedFeature>({
		hover: () => hover,
		getX: () => hoverGetX,
		getY: () => hoverGetY,
		width: () => width,
		height: () => height
	});

	// Geo's own extra step, outside the phase system - see `attachFeatureHover`.
	const geoMarkers = $derived(
		attachFeatureHover(plotState.markers ?? [], {
			hoverActive,
			hoverPointById,
			isOverInset,
			setHoverMatch: hoverController.ctrl.onPointer,
			clearHoverMatch: hoverController.ctrl.onLeave
		})
	);
</script>

<!-- `layoutScales` pins x/y to the lon/lat range, which `contour` markers read. -->
<BasePlotLayout
	{width}
	{height}
	data={features}
	getX={hoverGetX}
	getY={hoverGetY}
	{hover}
	scales={layoutScales}
	coordinates={resolvedCoordinates}
	{margins}
	marginEstimate={GEO_MARGIN_ESTIMATE}
	styles={resolvedStyles}
	{hoverController}
	markers={geoMarkers}
	geoAllFeatures={allFeatures}
/>
