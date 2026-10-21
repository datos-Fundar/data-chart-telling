<script
	lang="ts"
	generics="TData extends Record<string, unknown>, TSeries extends Record<string, unknown> = TData"
>
	import BarMarker from '$lib/markers/bar/BarMarker.svelte';
	import LineMarker from '$lib/markers/line/LineMarker.svelte';
	import CellMarker from '$lib/markers/cell/CellMarker.svelte';
	import RectMarker from '$lib/markers/rect/RectMarker.svelte';
	import RegressionMarker from '$lib/markers/regression/RegressionMarker.svelte';
	import BollingerMarker from '$lib/markers/bollinger/BollingerMarker.svelte';
	import AreaMarker from '$lib/markers/area/AreaMarker.svelte';
	import DensityMarker from '$lib/markers/density/DensityMarker.svelte';
	import BoxMarker from '$lib/markers/box/BoxMarker.svelte';
	import HullMarker from '$lib/markers/hull/HullMarker.svelte';
	import DifferenceMarker from '$lib/markers/difference/DifferenceMarker.svelte';
	import ArrowMarker from '$lib/markers/arrow/ArrowMarker.svelte';
	import BrushMarker from '$lib/markers/brush/BrushMarker.svelte';
	import DelaunayLinkMarker from '$lib/markers/delaunay/DelaunayLinkMarker.svelte';
	import DelaunayMeshMarker from '$lib/markers/delaunay/DelaunayMeshMarker.svelte';
	import VoronoiMarker from '$lib/markers/voronoi/VoronoiMarker.svelte';
	import VoronoiMeshMarker from '$lib/markers/voronoi/VoronoiMeshMarker.svelte';
	import ImageMarker from '$lib/markers/image/ImageMarker.svelte';
	import RasterMarker from '$lib/markers/raster/RasterMarker.svelte';
	import TickMarker from '$lib/markers/tick/TickMarker.svelte';
	import TrailMarker from '$lib/markers/trail/TrailMarker.svelte';
	import WaffleMarker from '$lib/markers/waffle/WaffleMarker.svelte';
	import DotMarker from '$lib/markers/dot/DotMarker.svelte';
	import TextMarker from '$lib/markers/text/TextMarker.svelte';
	import RuleMarker from '$lib/markers/rule/RuleMarker.svelte';
	import HoverMarker from '$lib/markers/hover/HoverMarker.svelte';
	import GeoHoverMarker from '$lib/markers/geo/GeoHoverMarker.svelte';
	import DeltaMarker from '$lib/markers/delta/DeltaMarker.svelte';
	import GeoFeaturesMarker from '$lib/markers/geo/GeoFeaturesMarker.svelte';
	import GraticuleMarker from '$lib/markers/geo/GraticuleMarker.svelte';
	import SphereMarker from '$lib/markers/geo/SphereMarker.svelte';
	import VectorMarker from '$lib/markers/vector/VectorMarker.svelte';
	import LinkMarker from '$lib/markers/link/LinkMarker.svelte';
	import ContourMarker from '$lib/markers/contour/ContourMarker.svelte';
	import ContourClipMarker from '$lib/markers/contour/ContourClipMarker.svelte';
	import InsetMarker from '$lib/markers/inset/InsetMarker.svelte';
	import FrameClip from '$lib/layout/geometry/FrameClip.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { PlotMargins } from '$lib/layout/margins/PlotMargins.svelte';
	import type { Series } from '$lib/types/plots/data/common';
	import type { MarkerConfig } from '$lib/types/markers/all';
	import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';
	import type { PlotHover } from '$lib/layout/hover/PlotHover.svelte';
	import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
	import type { GeoFeature } from '$lib/types/plots/data/geo';
	import { MarkerGrouping } from '$lib/phases/statistics/MarkerGrouping';
	import { FrameClipping } from '$lib/layout/geometry/FrameClipping';

	/**
	 * Renders every marker in `markers`, in array order, each delegated to the
	 * component that draws it. Owns only routing, plus the few extra props a
	 * marker kind needs beyond its own config (hover-controller state for
	 * `hover`; per-series data/color for a `series`-scoped `hover`/`component`).
	 *
	 * A marker scoped to one `series` renders against its entry in
	 * `scopedGroups`, since it needs that series' own data/color and resolved
	 * segments; one whose series has no entry renders nothing. `width`/`height`/`numericMargins`/
	 * `geoAllFeatures` are `GeoPlot`-only context an `inset` marker needs
	 * beyond its own config; `data` is `BasePlotLayout`'s own rows, forwarded
	 * as the fallback every `CommonMarkerConfig`-based marker's own (optional)
	 * `data` falls back to when unset, plus `contour`'s clip and unscoped
	 * `geo-component`'s fallback data - the latter two reachable only through
	 * `GeoMarkersConfig`, so `data` is always `GeoFeature`-shaped there
	 * despite the generic `TData` bound.
	 */
	let {
		width,
		height,
		markers = [],
		seriesData = [],
		scopedGroups = [],
		ctrl,
		numericMargins,
		data = [],
		geoAllFeatures = [],
		tooltipAnchorX,
		tooltipAnchorY
	}: {
		/** The plot's own outer width/height - sizes the content box an `inset` marker needs. */
		width?: number;
		height?: number;
		markers?: MarkerConfig[];
		/** All resolved series, forwarded to unscoped `component`/`delta` markers. Independently generic over `TSeries` (defaults to `TData`). */
		seriesData?: Series<TSeries>[];
		/** One entry per series that can own a `series`-scoped marker. Same `TSeries` as `seriesData`. */
		scopedGroups?: ScopedMarkerGroup<TSeries>[];
		/** `BasePlotLayout`'s own hover controller. */
		ctrl: PlotHover<TData>;
		/** The plot's own resolved margins - places the content box an `inset` marker needs. */
		numericMargins?: { top: number; right: number; bottom: number; left: number };
		/** `BasePlotLayout`'s own rows - `contour` (clip) and unscoped `geo-component` fallback data. */
		data?: TData[];
		/** `GeoPlot`'s own untouched, tagged features - `inset` marker only (shows a part the main map may exclude). */
		geoAllFeatures?: (GeoFeature<Record<string, unknown>> & { __id: string })[];
		/** The plot's own top-level `tooltip.anchorX`/`anchorY` - `inset` marker only, as the fallback its own tooltip inherits when unset. */
		tooltipAnchorX?: TooltipAnchorX;
		tooltipAnchorY?: TooltipAnchorY;
	} = $props();

	const cfg = $derived(getConfiguration());

	// Mounted inside svelteplot's `<Plot>`, the one place the margins it settles on can be read.
	PlotMargins.current()?.follow(usePlot().svelteplot);

	const scopedSeriesOf = (marker: MarkerConfig): string | undefined =>
		'series' in marker && typeof marker.series === 'string' && marker.series
			? marker.series
			: undefined;

	const groupByName = $derived(new Map(scopedGroups.map((group) => [group.name, group])));

	function markerKey(marker: MarkerConfig, i: number): string {
		const scope = scopedSeriesOf(marker);
		if (scope) return `${scope}-${marker.type}-${i}`;
		if (marker.type === 'rule') {
			// A rule over rows (`data`) has no value of its own to tell it from another one.
			const v = typeof marker.value === 'function' || marker.data ? i : marker.value;
			return `rule-${marker.axis}-${v}`;
		}
		if (marker.type === 'bar') return `bar-${marker.role}-${i}`;
		return `${marker.type}-${i}`;
	}
</script>

{#snippet renderMarker(marker: MarkerConfig, rows: TData[] | TSeries[])}
	{#if marker.type === 'bar'}
		<BarMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'line'}
		<LineMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'cell'}
		<CellMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'rect'}
		<RectMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'regression'}
		<RegressionMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'bollinger'}
		<BollingerMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'area'}
		<AreaMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'density'}
		<DensityMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'box'}
		<BoxMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'hull'}
		<HullMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'difference'}
		<DifferenceMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'arrow'}
		<ArrowMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'brush'}
		<BrushMarker {marker} />
	{:else if marker.type === 'delaunayLink'}
		<DelaunayLinkMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'delaunayMesh'}
		<DelaunayMeshMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'voronoi'}
		<VoronoiMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'voronoiMesh'}
		<VoronoiMeshMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'image'}
		<ImageMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'raster'}
		<RasterMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'tick'}
		<TickMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'trail'}
		<TrailMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'waffle'}
		<WaffleMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'dot'}
		<DotMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'text'}
		<TextMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'rule'}
		<RuleMarker {marker} />
	{:else if marker.type === 'geo'}
		<GeoFeaturesMarker {marker} />
	{:else if marker.type === 'graticule'}
		<GraticuleMarker {marker} />
	{:else if marker.type === 'sphere'}
		<SphereMarker {marker} />
	{:else if marker.type === 'vector'}
		<VectorMarker {marker} />
	{:else if marker.type === 'link'}
		<LinkMarker {marker} />
	{:else if marker.type === 'contour'}
		<!-- 'contour' only exists in GeoMarkersConfig, so `data` is always GeoFeature-shaped here despite the generic TData bound. -->
		<ContourClipMarker
			mode={marker.clip}
			features={data as unknown as GeoFeature<Record<string, unknown>>[]}
		>
			<ContourMarker {marker} />
		</ContourClipMarker>
	{:else if marker.type === 'inset'}
		<InsetMarker
			{marker}
			features={geoAllFeatures}
			width={Math.max(0, (width ?? 0) - (numericMargins?.left ?? 0) - (numericMargins?.right ?? 0))}
			height={Math.max(
				0,
				(height ?? 0) - (numericMargins?.top ?? 0) - (numericMargins?.bottom ?? 0)
			)}
			left={numericMargins?.left ?? 0}
			top={numericMargins?.top ?? 0}
			defaultFill={cfg.palette[0]}
			{tooltipAnchorX}
			{tooltipAnchorY}
		/>
	{:else if marker.type === 'component'}
		<marker.component {...marker.props} data={marker.data ?? seriesData} />
	{:else if marker.type === 'geo-component'}
		<marker.component {...marker.props} data={marker.data ?? rows} />
	{:else if marker.type === 'hover'}
		<HoverMarker
			{marker}
			data={ctrl.points}
			activePoint={ctrl.activePoint}
			impliesCrosshairX={ctrl.impliesCrosshairX}
			impliesCrosshairY={ctrl.impliesCrosshairY}
			onActivePointPixel={ctrl.reportActivePointPixel}
		/>
	{:else if marker.type === 'geo-hover'}
		<GeoHoverMarker {marker} data={ctrl.points} />
	{:else if marker.type === 'delta'}
		<DeltaMarker {marker} data={seriesData} />
	{/if}
{/snippet}

{#snippet renderScoped(marker: MarkerConfig, group: ScopedMarkerGroup<TSeries>)}
	{#if marker.type === 'hover'}
		{@const seriesPoints = ctrl.points.filter((p) => p.series === group.name)}
		{#if marker.scope === 'segment'}
			{#each group.segments as seg, segIdx (`${group.name}-hover-segment-${segIdx}`)}
				<!-- p.row (TData) is always a superset of TSeries in practice, not provable across two independent generics. -->
				{@const segPoints = seriesPoints.filter((p) => seg.match(p.row as unknown as TSeries))}
				{#if segPoints.length > 0}
					<HoverMarker
						marker={MarkerGrouping.withHoverSeriesColor(marker, seg.color)}
						data={segPoints}
						activePoint={segPoints[0] ?? null}
						impliesCrosshairX={ctrl.impliesCrosshairX}
						impliesCrosshairY={ctrl.impliesCrosshairY}
					/>
				{/if}
			{/each}
		{:else}
			<HoverMarker
				marker={MarkerGrouping.withHoverSeriesColor(
					marker,
					group.segments[0]?.color ?? group.color
				)}
				data={seriesPoints}
				activePoint={seriesPoints[0] ?? null}
				impliesCrosshairX={ctrl.impliesCrosshairX}
				impliesCrosshairY={ctrl.impliesCrosshairY}
			/>
		{/if}
	{:else if marker.type === 'component'}
		{#if marker.scope === 'segment'}
			{#each group.segments as seg, segIdx (`${group.name}-component-segment-${segIdx}`)}
				{@const segmentData = group.data.filter((row) => seg.match(row))}
				{#if segmentData.length > 0}
					<marker.component {...marker.props} series={group.name} data={segmentData} />
				{/if}
			{/each}
		{:else}
			<marker.component {...marker.props} series={group.name} data={group.data} />
		{/if}
	{:else}
		<FrameClip clip={FrameClipping.isClipped(marker)}>
			{@render renderMarker(MarkerGrouping.withSeriesColor(marker, group.color), group.data)}
		</FrameClip>
	{/if}
{/snippet}

<!-- Every marker in array order, so a later one always draws on top. -->
{#each markers as marker, i (markerKey(marker, i))}
	{@const scope = scopedSeriesOf(marker)}
	{#if scope === undefined}
		<FrameClip clip={FrameClipping.isClipped(marker)}>
			{@render renderMarker(marker, data)}
		</FrameClip>
	{:else if groupByName.has(scope)}
		{@render renderScoped(marker, groupByName.get(scope)!)}
	{/if}
{/each}
