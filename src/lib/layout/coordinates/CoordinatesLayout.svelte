<script lang="ts" generics="TData extends Record<string, unknown>">
	import type { ComponentProps, Snippet } from 'svelte';
	import { geoCentroid, type GeoPermissibleObjects } from 'd3-geo';
	import { Plot } from 'svelteplot';
	import { resolveProjection } from '$lib/layout/coordinates/resolveProjection';
	import { resolveCameraTarget } from '$lib/layout/coordinates/resolveCameraTarget';
	import { createGeoZoom, type GeoZoomTransform } from '$lib/layout/coordinates/zoom.svelte';
	import { createGeoRotate, type GeoRotate } from '$lib/layout/coordinates/rotate.svelte';
	import {
		createCameraTransformTween,
		createCameraRotateTween
	} from '$lib/layout/coordinates/camera.svelte';
	import CameraFit from '$lib/layout/coordinates/CameraFit.svelte';
	import type { CoordinatesConfig } from '$lib/types/layout/coordinates';

	type SveltePlotProps = ComponentProps<typeof Plot>;

	/**
	 * Resolves the active coordinate system (a `d3-geo` projection) and owns
	 * `<Plot>` itself, since `projection` must be known before it mounts.
	 * Also owns pan/zoom/rotate gesture state and the declarative `camera`,
	 * composed into the `<g>` transform wrapper (and, for `camera`/`rotate`
	 * on `orthographic`, into the projection's own `rotate`). A no-op for
	 * every plot kind but `GeoPlot`.
	 */
	let {
		width,
		height,
		margin,
		x,
		y,
		r = undefined,
		length = undefined,
		coordinates = undefined,
		locale = undefined,
		data,
		containerEl,
		remountKey = undefined,
		children
	}: {
		width: number;
		height: number;
		margin: SveltePlotProps['margin'];
		x: SveltePlotProps['x'];
		y: SveltePlotProps['y'];
		/** Forwarded verbatim to svelteplot's own `<Plot r>` — the plot-wide radius/size scale (see `RScaleConfig`'s own doc comment for why this is plot-wide only). */
		r?: SveltePlotProps['r'];
		/** Forwarded verbatim to svelteplot's own `<Plot length>` — the plot-wide vector/spike magnitude scale (see `LengthScaleConfig`'s own doc comment). */
		length?: SveltePlotProps['length'];
		coordinates?: CoordinatesConfig;
		/** Forwarded verbatim to svelteplot's own `<Plot locale>`. */
		locale?: SveltePlotProps['locale'];
		/** Fed to `resolveProjection`'s `domain: 'data'` sentinel and to `coordinates.camera`'s `{features}` target resolution. */
		data: TData[];
		containerEl?: HTMLDivElement;
		/** See `BasePlotLayout`'s own `remountKey` doc comment — forwarded verbatim to key svelteplot's `<Plot>` itself. */
		remountKey?: string | number;
		children: Snippet;
	} = $props();

	const resolvedProjection = $derived(
		coordinates ? resolveProjection(coordinates.projection, data) : undefined
	);

	const zoomEnabled = $derived(coordinates?.zoom !== false && coordinates?.zoom != null);
	const zoomConfig = $derived(typeof coordinates?.zoom === 'object' ? coordinates.zoom : undefined);
	const panEnabled = $derived(coordinates?.pan ?? false);

	const projectionType = $derived(
		typeof resolvedProjection === 'string' ? resolvedProjection : resolvedProjection?.type
	);

	/** `rotate` claims the drag gesture from `pan` on `orthographic` (spins the globe instead of panning it). `zoom`'s wheel/pinch scaling is unaffected. */
	const rotateEnabled = $derived(
		(coordinates?.rotate ?? false) && projectionType === 'orthographic'
	);
	const baseRotate = $derived.by((): GeoRotate => {
		const configured =
			typeof resolvedProjection === 'object' ? resolvedProjection?.rotate : undefined;
		return [configured?.[0] ?? 0, configured?.[1] ?? 0, configured?.[2] ?? 0];
	});

	const geoZoom = createGeoZoom({
		panEnabled: () => panEnabled && !rotateEnabled,
		zoomEnabled: () => zoomEnabled,
		config: () => zoomConfig,
		node: () => containerEl ?? null,
		disableDrag: () => rotateEnabled
	});

	const geoRotate = createGeoRotate({
		enabled: () => rotateEnabled,
		baseRotate: () => baseRotate,
		scale: () => geoZoom.transform.k,
		node: () => containerEl ?? null
	});

	// ── Declarative camera ────────────────────────────────────────────────────
	const cameraConfig = $derived(coordinates?.camera);
	const resolvedCameraTarget = $derived(
		cameraConfig
			? resolveCameraTarget(
					cameraConfig.target,
					data as unknown as { __id: string; geometry: GeoJSON.Geometry }[]
				)
			: undefined
	);
	const cameraActive = $derived(resolvedCameraTarget != null);

	/** `[-lon, -lat, gamma]` faces the target toward the viewer — only applied on `orthographic`, see `activeRotate`. */
	const cameraRotateTarget = $derived.by((): GeoRotate | undefined => {
		if (!resolvedCameraTarget) return undefined;
		if (resolvedCameraTarget.kind === 'point') {
			return [-resolvedCameraTarget.lon, -resolvedCameraTarget.lat, baseRotate[2]];
		}
		const [lon, lat] = geoCentroid(resolvedCameraTarget.geometry as GeoPermissibleObjects);
		return [-lon, -lat, baseRotate[2]];
	});

	const cameraRotateTween = createCameraRotateTween({
		target: () => (projectionType === 'orthographic' ? cameraRotateTarget : undefined),
		transition: () => cameraConfig?.transition
	});

	/** `camera` claims `rotate` outright on `orthographic` (only one `rotate` value exists at a time) — interactive `rotate` takes back over once `camera` is unset. */
	const cameraOrthoRotate = $derived(
		cameraActive && projectionType === 'orthographic' ? cameraRotateTween.current : undefined
	);
	const activeRotate = $derived(
		cameraOrthoRotate ?? (rotateEnabled ? geoRotate.rotate : baseRotate)
	);
	const rotateOverrideActive = $derived(cameraOrthoRotate != null || rotateEnabled);

	const finalProjection = $derived.by(() => {
		if (!rotateOverrideActive) return resolvedProjection;
		return {
			...(typeof resolvedProjection === 'string'
				? { type: resolvedProjection }
				: resolvedProjection),
			rotate: activeRotate
		};
	});

	// `CameraFit` (mounted inside `<Plot>`, below) reports the pixel `{x,y,k}` fitting `resolvedCameraTarget` against the live projection.
	let cameraFit = $state<GeoZoomTransform | undefined>(undefined);

	const cameraTransformTween = createCameraTransformTween({
		target: () => cameraFit,
		transition: () => cameraConfig?.transition
	});
	const cameraTransform = $derived(cameraTransformTween.current ?? { x: 0, y: 0, k: 1 });
</script>

{#key remountKey}
	<Plot
		{width}
		{height}
		{margin}
		{x}
		{y}
		{r}
		{length}
		{locale}
		projection={finalProjection as SveltePlotProps['projection']}
	>
		{#if cameraActive && resolvedCameraTarget}
			<CameraFit
				target={resolvedCameraTarget}
				anchor={cameraConfig?.anchor}
				padding={cameraConfig?.padding}
				zoom={cameraConfig?.zoom}
				{width}
				{height}
				onFit={(fit) => (cameraFit = fit)}
			/>
		{/if}
		<g transform="translate({cameraTransform.x}, {cameraTransform.y}) scale({cameraTransform.k})">
			<g
				transform="translate({geoZoom.transform.x}, {geoZoom.transform.y}) scale({geoZoom.transform
					.k})"
			>
				{@render children()}
			</g>
		</g>
	</Plot>
{/key}

<style>
	:global(figure.svelteplot svg) {
		overflow: visible;
	}
</style>
