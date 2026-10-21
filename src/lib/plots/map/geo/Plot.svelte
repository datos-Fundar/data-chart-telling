<script lang="ts" generics="TProps extends Record<string, unknown>">
	import Core from '$lib/plots/map/geo/Core.svelte';
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { merge } from '$lib/utils/merge';
	import { buildGeoDefaults } from '$lib/plots/map/geo/defaults';
	import { buildGeoSlicing } from '$lib/plots/map/geo/slices';
	import { createGeoFeatures } from '$lib/plots/map/geo/features.svelte';
	import type { GeoPlotProps, GeoPlotCoreProps } from '$lib/types/plots/map/geo/props';
	import type { GeoFeature } from '$lib/types/plots/data/geo';
	import type { GeoScalesConfig } from '$lib/types/layout/coordinates';
	import type { PlotCellContext } from '$lib/types/layout/plot';
	import type { TooltipConfig } from '$lib/types/plots/props';
	import type { TooltipProp } from '$lib/types/layout/tooltip';

	type Row = Record<string, unknown>;

	/**
	 * A map, rendered from GeoJSON or TopoJSON - `data` is the map itself.
	 * Optional chrome (`title`, `subtitle`, `caption`, `header`, `footer`,
	 * `legend`) frames it. `timeline` and `facet` slice its features and its
	 * markers' own rows by a field (a feature's from its `properties`); what
	 * lacks the field draws in every slice, and the color ramp spans every
	 * slice. With `coordinates.projection.domain: 'data'`, each facet zooms to
	 * its own features.
	 */
	let {
		title,
		subtitle,
		caption,
		header,
		footer,
		legend,
		order,
		tooltip,
		timeline,
		facet,
		margins = $bindable(),
		...core
	}: GeoPlotProps<TProps> = $props();

	const sliced = $derived(timeline != null || facet != null);
	// Only resolved here when slicing; otherwise the core resolves `data` itself.
	const resolved = createGeoFeatures<TProps>(
		() => (sliced ? core.data : []),
		() => core.object
	);
	const features = $derived(resolved.features as unknown as Row[]);
	const markerRows = $derived(
		(core.markers ?? []).flatMap((m) =>
			Array.isArray((m as { data?: unknown }).data) ? ((m as { data: Row[] }).data ?? []) : []
		)
	);
	const slicing = $derived(
		buildGeoSlicing({ rows: [...features, ...markerRows], timeline, facet })
	);

	/** The color ramp's domain over every feature, so each slice colors on the same scale. */
	const sharedColor = $derived.by((): GeoScalesConfig | undefined => {
		const value = core.color;
		if (!value) return undefined;
		const values = (resolved.features as GeoFeature<TProps>[])
			.map((f) => value(f))
			.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
		return values.length
			? { color: { domain: [Math.min(...values), Math.max(...values)] } }
			: undefined;
	});

	/** The core's props for one slice: the features and marker rows it keeps. */
	function sliceProps(slice: PlotCellContext<Row>): GeoPlotCoreProps<TProps> {
		const tip = slice.tooltip as TooltipConfig<GeoFeature<TProps>> | undefined;
		if (!sliced)
			return { ...core, width: slice.width, height: slice.height, margins, tooltip: tip };
		return {
			...core,
			data: features.filter(slice.keep) as unknown as GeoFeature<TProps>[],
			markers: core.markers?.map((m) => {
				const rows = (m as { data?: unknown }).data;
				return Array.isArray(rows) ? { ...m, data: (rows as Row[]).filter(slice.keep) } : m;
			}),
			width: slice.width,
			height: slice.height,
			margins: slice.margins ?? margins,
			scales: merge(sharedColor, core.scales),
			tooltip: tip
		} as GeoPlotCoreProps<TProps>;
	}
</script>

<Plot
	{Core}
	core={core as GeoPlotCoreProps<TProps>}
	defaults={buildGeoDefaults}
	slice={sliceProps}
	bind:margins
	{title}
	{subtitle}
	{caption}
	{header}
	{footer}
	{legend}
	{order}
	timeline={slicing.timeline}
	facet={slicing.facet}
	data={slicing.rows}
	tooltip={tooltip as TooltipProp<Row> | undefined}
/>
