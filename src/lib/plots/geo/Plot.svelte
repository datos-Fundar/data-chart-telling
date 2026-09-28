<script lang="ts" generics="TProps extends Record<string, unknown>">
	import { SvelteMap } from 'svelte/reactivity';
	import { isTopology, topologyToGeoJson } from '$lib/plots/utils/topojson';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { GEO_MARGIN_ESTIMATE } from '$lib/layout/coordinates/margins';
	import { buildData } from '$lib/plots/geo/phases/data';
	import { buildScales } from '$lib/plots/geo/phases/scales';
	import { buildMarkers } from '$lib/plots/geo/phases/markers';
	import { attachFeatureHover } from '$lib/plots/geo/attachFeatureHover';
	import { runStages } from '$lib/layout/phases/runStages';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import { hasHoverMarker } from '$lib/layout/tooltip/utils';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { GeoScalesConfig, CoordinatesConfig } from '$lib/types/layout/coordinates';
	import type { GeoFeature, GeoDataProps } from '$lib/types/plots/data/geo';
	import type { GeoStylesConfig } from '$lib/types/layout/styles';
	import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';
	import type { GeoMarkersConfig } from '$lib/types/markers/geo';
	import type { GeoPlotState, GeoPlotCtx, TaggedGeoFeature } from '$lib/types/plots/geo/state';
	import type { PhaseStage } from '$lib/types/layout/phases';

	/**
	 * A map, rendered from GeoJSON or TopoJSON. Unlike the other plot kinds
	 * there's no x/y axis pair: `data` IS the map. `segments` styles
	 * features by id; `color` + `scales.color` drive a continuous choropleth
	 * ramp. Everything drawn on top — points, arrows, links, contours,
	 * graticule/sphere — is a `markers` entry, assembled by the "markers"
	 * phase and routed through `GeometryLayout`.
	 */
	type TaggedFeature = TaggedGeoFeature<TProps>;

	type Props = BasePlotProps<
		GeoDataProps<TProps>,
		GeoFeature<TProps>,
		GeoStylesConfig<TProps>,
		GeoSegmentStyle,
		GeoMarkersConfig,
		GeoScalesConfig,
		CoordinatesConfig
	>;

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
		margins,
		tooltip = undefined
	}: Props = $props();

	const cfg = $derived(getConfiguration());

	// ── Resolve data: GeoJSON is synchronous, TopoJSON is converted async ────
	let topoFeatures = $state<GeoFeature<TProps>[] | null>(null);

	$effect(() => {
		if (!isTopology(data)) return;
		if (!object) {
			console.warn(
				'GeoPlot: `data` is a TopoJSON Topology but no `object` key was given — nothing will render.'
			);
			topoFeatures = [];
			return;
		}
		let cancelled = false;
		topologyToGeoJson<TProps>(data, object)
			.then((resolved) => {
				if (!cancelled) topoFeatures = resolved;
			})
			.catch((err) => {
				if (!cancelled) {
					console.warn(err instanceof Error ? err.message : String(err));
					topoFeatures = [];
				}
			});
		return () => {
			cancelled = true;
		};
	});

	const rawFeatures = $derived.by((): GeoFeature<TProps>[] => {
		if (isTopology(data)) return topoFeatures ?? [];
		if (Array.isArray(data)) return data;
		// `FeatureCollection.features` is GeoJSON's own `Feature<G, P>[]`, without
		// the `Record<string, unknown>` intersection `GeoFeature` adds to satisfy
		// this package's generic row-type bound — safe to assert, since every
		// property `GeoFeature` promises is already present.
		return data.features as GeoFeature<TProps>[];
	});

	// ── Tile-layer / projection compatibility ────────────────────────────────
	$effect(() => {
		if (!styles.tileLayer) return;
		const proj = coordinates.projection;
		const name = typeof proj === 'string' ? proj : proj?.type;
		if (name && name !== 'mercator' && name !== 'transverse-mercator') {
			console.warn(
				`GeoPlot: styles.tileLayer only renders correctly with a mercator-family projection — got "${name}". Rendering anyway.`
			);
		}
	});

	/**
	 * `coordinates.projection`, defaulted to `'mercator'` when unset and
	 * `styles.tileLayer` is active (the only projection family `TileLayer`
	 * renders correctly under) — folded in here, before `coordinates` reaches
	 * `BasePlotLayout`/`CoordinatesLayout`, since neither knows about
	 * `styles.tileLayer`.
	 */
	const resolvedCoordinates = $derived.by(
		(): CoordinatesConfig => ({
			...coordinates,
			projection: coordinates.projection ?? (styles.tileLayer ? 'mercator' : undefined)
		})
	);

	// ── Legend-driven range filter (mirrors HeatmapPlot's own) ────────────────
	const legendInteraction = $derived(getLegendInteraction());
	const range = $derived(legendInteraction?.continuousRange);

	/**
	 * `scales`, plus the fixed lon/lat frame every projection renders against
	 * — pinned here as an ordinary `x`/`y` domain, the same mechanism any
	 * axis-based plot kind uses to pin an axis, rather than a separate
	 * override prop. Used only for `BasePlotLayout`'s own `scales` prop —
	 * `buildScales`'s own pipeline input (below) stays the raw, author-facing
	 * `scales`, which has no use for a lon/lat frame.
	 */
	const layoutScales = $derived({
		...scales,
		x: { domain: [-180, 180] },
		y: { domain: [90, -90] }
	});

	// The plot's own pipeline, run once via `runStages`. No "mapping" stage —
	// feature-id resolution only ever feeds the "data" phase's own tagging, so
	// it's folded in there rather than kept as an independent phase.
	const stages: PhaseStage<GeoPlotState<TProps>, GeoPlotCtx<TProps>>[] = [
		{ phase: 'data', run: buildData },
		{ phase: 'scales', run: buildScales },
		{ phase: 'markers', run: buildMarkers }
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

	/**
	 * `styles`, with `features` tacked onto `tileLayer` (never author-facing —
	 * `GeoTileLayerConfig` doesn't declare it) so `StylesLayout` can compute
	 * the tile layer's auto-fit bounds without raw geometry threaded through
	 * as a separate prop. `excludeParts`-reduced `features`, matching what
	 * actually renders.
	 */
	const resolvedStyles = $derived(
		styles.tileLayer ? { ...styles, tileLayer: { ...styles.tileLayer, features } } : styles
	);

	// A feature outside the active range is dimmed in place, but never
	// surfaces in hover/tooltip — it's simply absent from the candidate list.
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

	/**
	 * `hoverPoints` keyed by feature `__id`, looked up from the exact feature
	 * the browser's own SVG hit-testing resolved a pointer event to (see
	 * `attachFeatureHover`). A feature absent here was filtered out of
	 * `hoverPoints` and correctly produces no match.
	 */
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
		// A map has no axis to draw a crosshair rule against — 'punctual' here
		// only means "exact XY hover match", unlike heatmap's own use of it.
		crosshair: false,
		sync: tooltip?.sync ?? false,
		tooltip,
		exclude: isOverInset,
		// A feature's true visual center can sit far from where the cursor
		// actually is on a large/irregular shape (e.g. an elongated province) —
		// 'contains' matches the feature the cursor is really over, via the
		// browser's own SVG hit-testing on each rendered feature path, rather
		// than 'nearest' centroid distance.
		pointMatching: 'contains' as const
	});

	/**
	 * The main map's own hover must never fire while the cursor is over an
	 * `inset` marker's panel, which draws at its own scale/projection.
	 * Checked via `e.target` (tagged with the `dct-geo-inset` ancestor class
	 * by `InsetMarker`'s own hit-test elements) rather than precomputed pixel
	 * bounds, since the browser's own hit-testing already accounts for any
	 * scale mismatch between `<Plot>`'s props and its rendered viewBox.
	 */
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

	// Geo's own extra step, outside the phase system — see `attachFeatureHover`.
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

<!--
  `layoutScales.x`/`.y`: pins the plot's generic linear scales to the full
  lon/lat range. Every geo-aware mark routes through the active projection
  instead, except svelteplot's `Contour`, whose grid reads `plot.scales.x`/`y`
  directly — this keeps a `contour` marker aligned with the map under it.
  `coordinates` being set is what tells `BasePlotLayout` to skip axis-tick
  rendering regardless of what `scales` carries — see its own doc comment.
-->
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
