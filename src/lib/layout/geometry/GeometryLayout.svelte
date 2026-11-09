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
	import ViolinMarker from '$lib/markers/violin/ViolinMarker.svelte';
	import WaffleMarker from '$lib/markers/waffle/WaffleMarker.svelte';
	import DotMarker from '$lib/markers/dot/DotMarker.svelte';
	import TextMarker from '$lib/markers/text/TextMarker.svelte';
	import RuleMarker from '$lib/markers/rule/RuleMarker.svelte';
	import BandMarker from '$lib/markers/band/BandMarker.svelte';
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
	import MarkerLabel from '$lib/markers/utils/MarkerLabel.svelte';
	import FrameClip from '$lib/layout/geometry/FrameClip.svelte';
	import MarkerOffset from '$lib/layout/geometry/MarkerOffset.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { PlotMargins } from '$lib/layout/margins/PlotMargins.svelte';
	import type { Series } from '$lib/types/plots/data/common';
	import type { MarkerConfig } from '$lib/types/markers/all';
	import type { CommonMarkerEvents } from '$lib/types/markers/channels/commonMarkerEvents';
	import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';
	import type { PlotHover } from '$lib/layout/hover/PlotHover.svelte';
	import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
	import type { GeoFeature } from '$lib/types/plots/data/geo';
	import { MarkerGrouping } from '$lib/phases/statistics/MarkerGrouping';
	import { FrameClipping } from '$lib/layout/geometry/FrameClipping';
	import { HoverShapes, type HoverShapesReach } from '$lib/layout/hover/HoverShapes';
	import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
	import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
	import { HoverLayers, type HoverPointGroup } from '$lib/layout/hover/HoverLayers';
	import { BandNudge } from '$lib/markers/utils/BandNudge';
	import { PointPixel } from '$lib/markers/utils/PointPixel';
	import { HoverDefaults } from '$lib/layout/hover/HoverDefaults';
	import type { HoverMarkerConfig } from '$lib/types/markers/common';

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
	const interaction = PlotInteraction.current(() => cfg);

	/**
	 * The markers, each `hover` one laid over the plot kind's own hover under the strategy in force - read as they
	 * are drawn, so a strategy changed while the plot is shown changes what the hover draws.
	 */
	const drawn = $derived.by(() => {
		const look = ctrl.look;
		return markers.map((marker) =>
			marker.type === 'hover'
				? (HoverDefaults.merge(look, marker as HoverMarkerConfig) as MarkerConfig)
				: marker
		);
	});

	/** The look the hover markers give the shapes linked to the hover. */
	const shapes = $derived(new HoverShapes(drawn));
	const reach: HoverShapesReach = {
		roleOf: (row, series) => ctrl.roleOf(row as TData, series),
		dimmed: (row) => {
			const series = row[SERIES_KEY];
			return typeof series === 'string' && interaction.fillFor(series) !== undefined;
		},
		get cfg() {
			return cfg;
		}
	};

	// Mounted inside svelteplot's `<Plot>`, the one place the margins it settles on can be read.
	const svelteplot = usePlot().svelteplot;
	PlotMargins.current()?.follow(svelteplot);

	/**
	 * The points a hover marker draws over: every matched one; with `series`, that series' only, in its color -
	 * or with `scope: 'segment'`, each segment's, in the segment's. The first is the active one of a series.
	 */
	function hoverGroupsOf(marker: HoverMarkerConfig): HoverPointGroup[] {
		const points = ctrl.points;
		if (points.length === 0) return [];
		const nearest = JSON.parse(nearestKey || '{}') as {
			all?: number;
			bySeries?: Record<string, number>;
		};
		const scope = marker.series;
		if (!scope) {
			const active = nearest.all !== undefined ? points[nearest.all] : undefined;
			return [{ key: '', points, active: active ?? ctrl.activePoint }];
		}
		const under = nearest.bySeries?.[scope];
		const activeOf = (list: typeof points) =>
			(under !== undefined && list.find((p) => p.row === points[under].row)) || list[0] || null;
		const group = groupByName.get(scope);
		if (!group) return [];
		const own = points.filter((p) => p.series === scope);
		const colored = (list: typeof own, color: string | undefined) =>
			color ? list.map((p) => ({ ...p, color })) : list;
		if (marker.scope !== 'segment') {
			const seriesPoints = colored(own, group.segments[0]?.color ?? group.color);
			return [{ key: scope, points: seriesPoints, active: activeOf(seriesPoints) }];
		}
		return group.segments.map((seg, i) => {
			// p.row (TData) is always a superset of TSeries in practice, not provable across two independent generics.
			const segPoints = colored(
				own.filter((p) => seg.match(p.row as unknown as TSeries)),
				seg.color
			);
			return { key: `${scope}-${i}`, points: segPoints, active: activeOf(segPoints) };
		});
	}

	/**
	 * The hovered point under the pointer: of all of them, and of each series - the nearest to the pointer, not the
	 * first the strategy matched, so a crosshair at it follows the pointer across the series of a category. Kept as
	 * text, so the hover's markers are built again only when it changes, not at every move of the pointer.
	 */
	const nearestKey = $derived.by(() => {
		const cursor = ctrl.cursor;
		const points = ctrl.points;
		if (!cursor || points.length === 0) return '';
		const all = PointPixel.nearest(svelteplot.scales, points, cursor);
		const bySeries: Record<string, number> = {};
		for (const series of new Set(points.map((p) => p.series))) {
			if (series == null) continue;
			const indexes = points.flatMap((p, i) => (p.series === series ? [i] : []));
			const nearest = PointPixel.nearest(
				svelteplot.scales,
				indexes.map((i) => points[i]),
				cursor
			);
			if (nearest >= 0) bySeries[series] = indexes[nearest];
		}
		return JSON.stringify({ all: all >= 0 ? all : undefined, bySeries });
	});

	/** The markers `marker`'s `layer` draws, over each group of the points it draws over. */
	function hoverPartsOf(marker: HoverMarkerConfig, layer: 'back' | 'front', index: number) {
		return hoverGroupsOf(marker).flatMap((group) =>
			HoverLayers.parts(
				marker,
				layer,
				{
					...group,
					points: HoverLayers.labelled(group.points, marker, cfg),
					active: group.active && HoverLayers.labelled([group.active], marker, cfg)[0]
				},
				cfg
			).map((part) => ({ ...part, key: `${index}-${part.key}` }))
		);
	}

	/**
	 * What each hover marker draws, behind and in front, built once per hover - not as it is drawn, where reading
	 * the scales would build its markers anew whenever svelteplot settles them, and settle them again.
	 */
	const hoverLayers = $derived(
		new Map(
			drawn.flatMap((marker, index) =>
				marker.type === 'hover'
					? [
							[
								index,
								{
									back: hoverPartsOf(marker as HoverMarkerConfig, 'back', index),
									front: hoverPartsOf(marker as HoverMarkerConfig, 'front', index)
								}
							] as const
						]
					: []
			)
		)
	);

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

	/**
	 * A marker with `hover: true` or `'trigger'`, with the plot's hover added to its own pointer handlers: entering or
	 * moving over one of its shapes hovers that shape's row, and leaving it ends the hover.
	 */
	function withHover(marker: MarkerConfig, rows: TData[] | TSeries[]): MarkerConfig {
		if (!('hover' in marker) || (marker.hover !== true && marker.hover !== 'trigger'))
			return marker;
		const own = marker as CommonMarkerEvents & { data?: unknown[] };
		// The row of the shape under the pointer - a copy svelteplot hands over, which the hover finds by its place.
		const hovered = (row: unknown) => [(row ?? (own.data ?? rows)[0]) as TData];
		return {
			...marker,
			onpointerenter: (event: Event, row: unknown, index: number) => {
				own.onpointerenter?.(event, row, index);
				ctrl.onPointer(hovered(row));
			},
			onpointerleave: (event: Event, row: unknown, index: number) => {
				own.onpointerleave?.(event, row, index);
				ctrl.onLeave();
			},
			onpointermove: (event: Event, row: unknown, index: number) => {
				own.onpointermove?.(event, row, index);
				ctrl.onPointer(hovered(row));
			}
		} as MarkerConfig;
	}
</script>

{#snippet drawMarker(marker: MarkerConfig, rows: TData[] | TSeries[])}
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
	{:else if marker.type === 'violin'}
		<ViolinMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'waffle'}
		<WaffleMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'dot'}
		<DotMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'text'}
		<TextMarker marker={{ ...marker, data: marker.data ?? rows }} />
	{:else if marker.type === 'rule'}
		<RuleMarker {marker} />
	{:else if marker.type === 'band'}
		<BandMarker {marker} />
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
	{:else if marker.type === 'geo-hover'}
		<GeoHoverMarker {marker} data={ctrl.points} />
	{:else if marker.type === 'delta'}
		<DeltaMarker {marker} data={seriesData} />
	{/if}
{/snippet}

{#snippet renderMarker(marker: MarkerConfig, rows: TData[] | TSeries[])}
	<!-- In parts the hover styles alike, while it restyles the marker's shapes. -->
	{#each shapes.split(withHover(marker, rows), rows, reach) as part (part.key)}
		<MarkerOffset marker={part.marker}>
			{@render drawMarker(part.marker, rows)}
		</MarkerOffset>
	{/each}
{/snippet}

{#snippet renderScoped(marker: MarkerConfig, group: ScopedMarkerGroup<TSeries>)}
	{#if marker.type === 'component'}
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

{#snippet renderHoverLayer(index: number, layer: 'back' | 'front')}
	{#each hoverLayers.get(index)?.[layer] ?? [] as part (part.key)}
		<!-- A point in a slice of its band (a grouped bar's series) is drawn in the middle of it. -->
		{@const nudge = BandNudge.of(svelteplot.scales, part.slice)}
		<g transform="translate({nudge.dx}, {nudge.dy})">
			<FrameClip clip={FrameClipping.isClipped(part.marker)}>
				{@render renderMarker(part.marker as MarkerConfig, data)}
			</FrameClip>
		</g>
	{/each}
{/snippet}

<!-- What the hover draws behind the plot's shapes, before any of them. -->
{#each [...hoverLayers.keys()] as index (index)}
	{@render renderHoverLayer(index, 'back')}
{/each}

<!-- Every marker in array order, so a later one always draws on top; a hover marker draws its front markers. -->
{#each markers as marker, i (markerKey(marker, i))}
	{@const scope = scopedSeriesOf(marker)}
	{#if marker.type === 'hover'}
		{#if scope === undefined}
			<HoverMarker
				activePoint={ctrl.activePoint}
				onActivePointPixel={ctrl.reportActivePointPixel}
			/>
		{/if}
		{@render renderHoverLayer(i, 'front')}
	{:else if scope === undefined}
		<FrameClip clip={FrameClipping.isClipped(marker)}>
			{@render renderMarker(marker, data)}
		</FrameClip>
	{:else if groupByName.has(scope)}
		{@render renderScoped(marker, groupByName.get(scope)!)}
	{/if}
{/each}

<!--
	The labels the shapes write in themselves, after every marker - the hover's hit areas too, which are the last of them -
	so a label that listens for the pointer is not covered, and one outside its shape is not clipped with it.
-->
{#each markers as marker, i (markerKey(marker, i))}
	{@const scope = scopedSeriesOf(marker)}
	{#if 'label' in marker && marker.label && (scope === undefined || groupByName.has(scope))}
		<!-- Split as the shapes are, so a label reads on its shape's color under the hover. -->
		{#each shapes.split(marker, data, reach) as part (part.key)}
			<MarkerOffset marker={part.marker}>
				<MarkerLabel marker={{ ...part.marker, data: part.marker.data ?? data }} />
			</MarkerOffset>
		{/each}
	{/if}
{/each}
