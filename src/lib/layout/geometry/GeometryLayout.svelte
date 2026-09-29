<script
	lang="ts"
	generics="TData extends Record<string, unknown>, TSeries extends Record<string, unknown> = TData"
>
	import { SvelteMap } from 'svelte/reactivity';
	import BarMarker from '$lib/markers/BarMarker.svelte';
	import LineMarker from '$lib/markers/LineMarker.svelte';
	import CellMarker from '$lib/markers/CellMarker.svelte';
	import RectMarker from '$lib/markers/RectMarker.svelte';
	import RegressionMarker from '$lib/markers/RegressionMarker.svelte';
	import BollingerMarker from '$lib/markers/BollingerMarker.svelte';
	import DotMarker from '$lib/markers/DotMarker.svelte';
	import TextMarker from '$lib/markers/TextMarker.svelte';
	import RuleMarker from '$lib/markers/RuleMarker.svelte';
	import HoverMarker from '$lib/markers/HoverMarker.svelte';
	import GeoHoverMarker from '$lib/markers/GeoHoverMarker.svelte';
	import DeltaMarker from '$lib/markers/DeltaMarker.svelte';
	import GeoFeaturesMarker from '$lib/markers/GeoFeaturesMarker.svelte';
	import GraticuleMarker from '$lib/markers/GraticuleMarker.svelte';
	import SphereMarker from '$lib/markers/SphereMarker.svelte';
	import VectorMarker from '$lib/markers/VectorMarker.svelte';
	import LinkMarker from '$lib/markers/LinkMarker.svelte';
	import ContourMarker from '$lib/markers/ContourMarker.svelte';
	import ContourClipMarker from '$lib/markers/ContourClipMarker.svelte';
	import InsetMarker from '$lib/markers/inset/InsetMarker.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import type { Series } from '$lib/types/plots/data/common';
	import type { HoverMarkerConfig, CustomComponentMarkerConfig } from '$lib/types/markers/common';
	import type { MarkerConfig } from '$lib/types/markers/all';
	import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';
	import type { HoverController } from '$lib/layout/tooltip/controller.svelte';
	import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
	import type { GeoFeature } from '$lib/types/plots/data/geo';
	import type { ChannelScalesConfig } from '$lib/types/layout/scales';

	/**
	 * Renders every marker in `markers`, in array order, each delegated to the
	 * component that draws it. Owns only routing, plus the few extra props a
	 * marker kind needs beyond its own config (hover-controller state for
	 * `hover`; per-series data/color for a `series`-scoped `hover`/`component`).
	 *
	 * A marker scoped to one `series` renders once per matching entry in
	 * `scopedGroups` instead of the plain loop, since it needs that series'
	 * own data/color and resolved segments. `width`/`height`/`numericMargins`/
	 * `geoAllFeatures` are `GeoPlot`-only context an `inset` marker needs
	 * beyond its own config; `data` is `BasePlotLayout`'s own rows, forwarded
	 * as the fallback every `CommonMarkerConfig`-based marker's own (optional)
	 * `data` falls back to when unset, plus `contour`'s clip and unscoped
	 * `geo-component`'s fallback data — the latter two reachable only through
	 * `GeoMarkersConfig`, so `data` is always `GeoFeature`-shaped there
	 * despite the generic `TData` bound.
	 */
	let {
		width,
		height,
		markers = [],
		seriesData = [],
		scopedGroups = [],
		channelScales = undefined,
		ctrl,
		numericMargins,
		data = [],
		geoAllFeatures = [],
		tooltipAnchorX,
		tooltipAnchorY
	}: {
		/** The plot's own outer width/height — `inset` marker only, to size its content box. */
		width?: number;
		height?: number;
		markers?: MarkerConfig[];
		/** All resolved series, forwarded to unscoped `component`/`delta` markers. Independently generic over `TSeries` (defaults to `TData`). */
		seriesData?: Series<TSeries>[];
		/** One entry per series that can own a `series`-scoped marker. Same `TSeries` as `seriesData`. */
		scopedGroups?: ScopedMarkerGroup<TSeries>[];
		/** This plot kind's own `color`/`grouping` channel config — the fallback a marker's own `scales` inherits when it sets none of its own. */
		channelScales?: ChannelScalesConfig;
		/** `BasePlotLayout`'s own hover controller. */
		ctrl: HoverController<TData>;
		/** The plot's own resolved margins — `inset` marker only, to place its content box. */
		numericMargins?: { top: number; right: number; bottom: number; left: number };
		/** `BasePlotLayout`'s own rows — `contour` (clip) and unscoped `geo-component` fallback data. */
		data?: TData[];
		/** `GeoPlot`'s own untouched, tagged features — `inset` marker only (shows a part the main map may exclude). */
		geoAllFeatures?: (GeoFeature<Record<string, unknown>> & { __id: string })[];
		/** The plot's own top-level `tooltip.anchorX`/`anchorY` — `inset` marker only, as the fallback its own tooltip inherits when unset. */
		tooltipAnchorX?: TooltipAnchorX;
		tooltipAnchorY?: TooltipAnchorY;
	} = $props();

	const cfg = $derived(getConfiguration());

	const geometryMarkers = $derived(
		markers.filter(
			(marker) =>
				!(
					(marker.type === 'hover' || marker.type === 'component') &&
					'series' in marker &&
					marker.series
				)
		)
	);

	const scopedMarkersByName = $derived.by(() => {
		const map = new SvelteMap<string, (HoverMarkerConfig | CustomComponentMarkerConfig)[]>();
		for (const marker of markers) {
			if (
				(marker.type === 'hover' || marker.type === 'component') &&
				'series' in marker &&
				marker.series
			) {
				if (!map.has(marker.series)) map.set(marker.series, []);
				map.get(marker.series)!.push(marker);
			}
		}
		return map;
	});

	function markerKey(marker: MarkerConfig, i: number): string {
		if (marker.type === 'rule') return `rule-${marker.axis}-${marker.value}`;
		if (marker.type === 'bar') return `bar-${marker.role}-${i}`;
		return `${marker.type}-${i}`;
	}
</script>

{#each geometryMarkers as marker, i (markerKey(marker, i))}
	{#if marker.type === 'bar'}
		<BarMarker marker={{ ...marker, data: marker.data ?? data }} />
	{:else if marker.type === 'line'}
		<LineMarker marker={{ ...marker, data: marker.data ?? data }} />
	{:else if marker.type === 'cell'}
		<CellMarker marker={{ ...marker, data: marker.data ?? data }} />
	{:else if marker.type === 'rect'}
		<RectMarker marker={{ ...marker, data: marker.data ?? data }} />
	{:else if marker.type === 'regression'}
		<RegressionMarker marker={{ ...marker, data: marker.data ?? data }} />
	{:else if marker.type === 'bollinger'}
		<BollingerMarker marker={{ ...marker, data: marker.data ?? data }} />
	{:else if marker.type === 'dot'}
		<DotMarker
			data={marker.data ?? data}
			x={marker.x != null ? resolveAccessor(marker.x) : undefined}
			y={marker.y != null ? resolveAccessor(marker.y) : undefined}
			r={typeof marker.r === 'number' || marker.r == null ? marker.r : resolveAccessor(marker.r)}
			fill={marker.fill}
			color={marker.color ? resolveAccessor(marker.color) : undefined}
			opacity={marker.opacity ? resolveAccessor(marker.opacity) : undefined}
			symbol={marker.symbol ? resolveAccessor(marker.symbol) : undefined}
			scales={marker.scales ?? channelScales}
			styles={marker.styles}
		/>
	{:else if marker.type === 'text'}
		<TextMarker
			data={marker.data ?? data}
			x={marker.x != null ? resolveAccessor(marker.x) : undefined}
			y={marker.y != null ? resolveAccessor(marker.y) : undefined}
			text={marker.text}
			styles={marker.styles}
		/>
	{:else if marker.type === 'rule'}
		<RuleMarker axis={marker.axis} value={marker.value} styles={marker.styles} />
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
		<marker.component {...marker.props} data={marker.data ?? data} />
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
{/each}

{#each scopedGroups as group (group.name)}
	{#each scopedMarkersByName.get(group.name) ?? [] as marker, i (`${group.name}-${marker.type}-${i}`)}
		{#if marker.type === 'hover'}
			{@const seriesPoints = ctrl.points.filter((p) => p.series === group.name)}
			{#if marker.scope === 'segment'}
				{#each group.segments as seg, segIdx (`${group.name}-hover-segment-${segIdx}`)}
					<!-- p.row (TData) is always a superset of TSeries in practice, not provable across two independent generics. -->
					{@const segPoints = seriesPoints.filter((p) => seg.match(p.row as unknown as TSeries))}
					{#if segPoints.length > 0}
						<HoverMarker
							{marker}
							data={segPoints}
							activePoint={segPoints[0] ?? null}
							impliesCrosshairX={ctrl.impliesCrosshairX}
							impliesCrosshairY={ctrl.impliesCrosshairY}
							seriesColor={seg.color}
						/>
					{/if}
				{/each}
			{:else}
				<HoverMarker
					{marker}
					data={seriesPoints}
					activePoint={seriesPoints[0] ?? null}
					impliesCrosshairX={ctrl.impliesCrosshairX}
					impliesCrosshairY={ctrl.impliesCrosshairY}
					seriesColor={group.segments[0]?.color ?? group.color}
				/>
			{/if}
		{:else if marker.type === 'component'}
			{#if marker.scope === 'segment'}
				{#each group.segments as seg, segIdx (`${group.name}-component-segment-${segIdx}`)}
					{@const segmentData = group.data.filter((row) => seg.match(row))}
					{#if segmentData.length > 0}
						<marker.component
							{...marker.props}
							series={group.name}
							data={segmentData}
							seriesColor={seg.color}
						/>
					{/if}
				{/each}
			{:else}
				<marker.component
					{...marker.props}
					series={group.name}
					data={group.data}
					seriesColor={group.segments[0]?.color ?? group.color}
				/>
			{/if}
		{/if}
	{/each}
{/each}
