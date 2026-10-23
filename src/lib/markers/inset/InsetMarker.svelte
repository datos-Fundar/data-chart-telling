<script lang="ts" generics="TProps extends Record<string, unknown>">
	import { geoPath } from 'd3-geo';
	import { buildInsetProjection } from './insetProjection';
	import { insetBox } from './insetLayout';
	import { GeoGeometry } from '$lib/plots/map/geo/GeoGeometry';
	import Tooltip from '$lib/layout/tooltip/Tooltip.svelte';
	import type { GeoInsetMarkerConfig } from '$lib/types/markers/geo';
	import type { GeoFeature } from '$lib/types/plots/data/geo';
	import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';

	/**
	 * A small, independently-projected map panel anchored to a corner/edge of
	 * the plot - see `GeoInsetMarkerConfig`'s doc comment. Renders raw `<path>`s via
	 * its own `d3-geo` `geoPath`, deliberately not svelteplot's `<Geo>` mark:
	 * that mark is bound to the plot's *shared* projection scale, but an inset
	 * needs its own, independently fit to just what it's showing.
	 */
	let {
		marker,
		features,
		width,
		height,
		left = 0,
		top = 0,
		defaultFill,
		tooltipAnchorX,
		tooltipAnchorY
	}: {
		marker: GeoInsetMarkerConfig<TProps>;
		/**
		 * The plot's own already-tagged features (`__id` set), with full,
		 * unreduced geometry regardless of the plot's own `excludeParts` - used
		 * when `marker.data` is omitted, so an inset can show a part the main
		 * map excludes without needing a separate dataset.
		 */
		features: (GeoFeature<TProps> & { __id: string })[];
		/**
		 * The plot's own *content* width/height - i.e. already net of margins,
		 * matching the frame the map itself is actually drawn into (svelteplot
		 * bakes margins into the projection's scale/translate rather than
		 * wrapping marks in a translating `<g>`, so this needs to match, not the
		 * plot's raw outer width/height) - `location`'s edge and `margin`'s gap
		 * are both measured against this box, not the full canvas.
		 */
		width: number;
		height: number;
		/** Top-left corner of that content box, in the plot's own absolute coordinate space (i.e. its margins). */
		left?: number;
		top?: number;
		defaultFill: string;
		/** The plot's own top-level `tooltip.anchorX`/`anchorY` - the fallback this inset's own tooltip inherits when its own is unset, before the system default. */
		tooltipAnchorX?: TooltipAnchorX;
		tooltipAnchorY?: TooltipAnchorY;
	} = $props();

	const insetFeatures = $derived.by((): GeoFeature<Record<string, unknown>>[] => {
		if (marker.data) {
			return (Array.isArray(marker.data) ? marker.data : marker.data.features) as GeoFeature<
				Record<string, unknown>
			>[];
		}
		if (marker.features?.length) {
			const wanted = new Set(marker.features);
			const matched = features.filter((f) => wanted.has(f.__id));
			if (!marker.featurePartsFilter) return matched;
			const partsFilter = marker.featurePartsFilter;
			return matched.flatMap((f) => {
				const geometry = GeoGeometry.filterParts(f.geometry, (part) => partsFilter(part, f));
				return geometry ? [{ ...f, geometry }] : [];
			});
		}
		return [];
	});

	const box = $derived(
		insetBox(
			marker.location,
			marker.width ?? 0.26,
			marker.height ?? 0.22,
			marker.margin ?? 8,
			width,
			height
		)
	);

	const path = $derived.by(() => {
		if (insetFeatures.length === 0 || box.width <= 0 || box.height <= 0) return null;
		const projection = buildInsetProjection(marker.projection);
		const collection: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: insetFeatures
		};
		projection.fitExtent(
			[
				[0, 0],
				[box.width, box.height]
			],
			collection
		);
		return geoPath(projection);
	});

	let hovered = $state<{
		feature: GeoFeature<Record<string, unknown>>;
		x: number;
		y: number;
	} | null>(null);

	/**
	 * Purely a coordinate reference (`pointer-events: none` - never itself a
	 * hover target) sized exactly to the inset's own box, so `onInsetPointer*`
	 * below can convert a screen-space pointer event into the same box-local
	 * `x`/`y` space `Tooltip`'s `bounds` expects, the same way
	 * `BasePlotLayout`'s own cursor tracking does for the main map.
	 */
	let boxRectEl = $state<SVGRectElement>();

	/**
	 * Which exact feature `<path>` the browser's own SVG hit-testing resolved
	 * the event to - mirrors the main map's own `<Geo onpointerenter>` (see
	 * `Plot.svelte`) rather than approximating it by nearest centroid
	 * distance, which used to make hover pick the wrong (if geometrically
	 * nearer-by-centroid) neighboring feature, exactly the bug that fix
	 * addressed for the main map.
	 */
	function onInsetFeaturePointer(e: PointerEvent, f: GeoFeature<Record<string, unknown>>) {
		const rect = boxRectEl?.getBoundingClientRect();
		const x = e.clientX - (rect?.left ?? 0);
		const y = e.clientY - (rect?.top ?? 0);
		hovered = { feature: f, x, y };
	}

	function onInsetFeatureLeave() {
		hovered = null;
	}
</script>

{#if path}
	<g class="dct-geo-inset" transform="translate({box.left + left}, {box.top + top})">
		{#each insetFeatures as f, i (i)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<path
				d={path(f as GeoJSON.Feature) ?? undefined}
				fill={marker.styles?.fill ?? defaultFill}
				fill-opacity={marker.styles?.fillOpacity}
				stroke={marker.styles?.stroke ?? 'currentColor'}
				stroke-width={marker.styles?.strokeWidth ?? 0.5}
				style="vector-effect: non-scaling-stroke"
				onpointerenter={marker.tooltip
					? (e: PointerEvent) => onInsetFeaturePointer(e, f)
					: undefined}
				onpointermove={marker.tooltip
					? (e: PointerEvent) => onInsetFeaturePointer(e, f)
					: undefined}
				onpointerleave={marker.tooltip ? onInsetFeatureLeave : undefined}
			/>
		{/each}
		{#if marker.tooltip}
			<rect
				x={0}
				y={0}
				width={box.width}
				height={box.height}
				fill="transparent"
				pointer-events="none"
				bind:this={boxRectEl}
			/>
		{/if}
		{#if marker.tooltip}
			{@const tooltip = marker.tooltip}
			<foreignObject
				x={0}
				y={0}
				width={box.width}
				height={box.height}
				style="overflow: visible; pointer-events: none;"
			>
				<div
					xmlns="http://www.w3.org/1999/xhtml"
					style="position: relative; width: 100%; height: 100%;"
				>
					<Tooltip
						visible={hovered != null}
						x={hovered?.x ?? 0}
						y={hovered?.y ?? 0}
						bounds={{ width: box.width, height: box.height }}
						rows={hovered ? [hovered.feature] : []}
						format={tooltip.format}
						content={tooltip.content}
						anchorX={tooltip.anchorX ?? tooltipAnchorX}
						anchorY={tooltip.anchorY ?? tooltipAnchorY}
					/>
				</div>
			</foreignObject>
		{/if}
	</g>
{/if}
