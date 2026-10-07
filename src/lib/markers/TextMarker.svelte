<script lang="ts" generics="TData = Record<string, unknown>">
	import { Text, usePlot } from 'svelteplot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { buildLabelLanes } from '$lib/plots/utils/declutter';
	import { watchLabelOverflow } from '$lib/plots/utils/labelOverflow.svelte';
	import { resolveEdgeAwareAnchor } from '$lib/utils/edgeAwareAnchor';
	import { measureTextWidth } from '$lib/layout/plot/measureText';
	import type { TextMarkerConfig } from '$lib/types/markers/common';
	import type { TextAnchor } from '$lib/types/plots/constants';

	/**
	 * Renders one `'text'` marker. `x`/`y` also accept a literal number/Date
	 * (every row draws at that fixed position). A marker that declutters, flips
	 * at the edges or listens to the pointer draws one label per row, so each
	 * row can move and carry its own connector and handlers. `bounds` is the
	 * plot's content box, which `declutter` keeps labels inside and
	 * `onOverflow` measures against.
	 */
	const {
		marker,
		bounds
	}: {
		marker: TextMarkerConfig;
		bounds?: { left: number; right: number; top: number; bottom: number };
	} = $props();

	const cfg = $derived(getConfiguration());
	const plot = usePlot();

	const data = $derived((marker.data ?? []) as TData[]);
	const x = $derived(marker.x);
	const y = $derived(marker.y);
	const text = $derived(marker.text ?? '');
	const styles = $derived(marker.styles);

	const displayData = $derived(data.length > 0 ? data : [{} as TData]);
	// Per-row accessors are literal values, not data for svelteplot's color/opacity
	// scales, and one that comes back empty takes the flat default — svelteplot
	// drops a row whose channel reads undefined.
	const flatFill = $derived(styles?.fill ?? 'currentColor');
	const fill = $derived.by(() => {
		const own = marker.fill;
		if (typeof own !== 'function') return own ?? flatFill;
		return { value: (d: TData) => own(d) ?? flatFill, scale: null };
	});
	const fillOpacity = $derived.by(() => {
		const own = marker.fillOpacity;
		return typeof own === 'function' ? { value: (d: TData) => own(d) ?? 1, scale: null } : own;
	});
	const fontSize = $derived(styles?.fontSize ?? 12);
	const fontWeight = $derived(styles?.fontWeight ?? 'normal');
	const fontStyleProp = $derived(styles?.fontStyle ?? 'normal');
	// 'outside' is meant to be resolved per-point by the caller (see
	// HoverMarker, which knows each point's signed x); a caller that passes it
	// through unresolved falls back to 'start' rather than an invalid svelteplot value.
	const textAnchor = $derived<Exclude<TextAnchor, 'outside'>>(
		styles?.textAnchor === 'outside' ? 'start' : (styles?.textAnchor ?? 'middle')
	);
	const lineAnchor = $derived(styles?.lineAnchor ?? 'middle');
	const dx = $derived(styles?.dx ?? 0);
	const dy = $derived(styles?.dy ?? 0);

	const declutter = $derived.by(() => {
		if (!marker.declutter) return undefined;
		const own = marker.declutter === true ? {} : marker.declutter;
		const defaults = cfg.text.declutter;
		return {
			elbowGap: own.elbowGap ?? defaults.elbowGap,
			laneStep: own.laneStep ?? defaults.laneStep,
			labelGap: own.labelGap ?? defaults.labelGap,
			connector: { ...defaults.connector, ...own.connector }
		};
	});
	const perRow = $derived(
		!!declutter || !!marker.edgeAware || !!marker.onPointerEnter || !!marker.onPointerLeave
	);
	const dir = $derived(Math.sign(dx) || 1);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function channel(value: unknown): (d: any) => unknown {
		if (typeof value === 'function') return value as (d: unknown) => unknown;
		// A field key: a name, or the symbol a transform keyed its output channel by.
		if (typeof value === 'string' || typeof value === 'symbol') return (d) => d?.[value];
		return () => value;
	}

	function textOf(d: TData): string {
		return typeof text === 'function' ? text(d) : text;
	}

	function opacityOf(d: TData): number | undefined {
		const value = marker.fillOpacity;
		return typeof value === 'function' ? value(d) : value;
	}

	/** Each row's pixel position, once both scales resolve. */
	const points = $derived.by(() => {
		const xScale = plot.scales.x?.fn;
		const yScale = plot.scales.y?.fn;
		if ((!declutter && !marker.edgeAware) || !xScale || !yScale) return undefined;
		const xOf = channel(x ?? 0);
		const yOf = channel(y ?? 0);
		return displayData.map((d) => ({
			px: Number(xScale(xOf(d) as never)),
			py: Number(yScale(yOf(d) as never))
		}));
	});

	const lanes = $derived(
		declutter && points && bounds
			? buildLabelLanes({
					items: points.map((p, key) => ({ key, ...p })),
					dx,
					fontSize,
					geometry: declutter,
					bounds
				})
			: undefined
	);

	/**
	 * Each row's anchor and offset, flipped to the other side of its point
	 * where its text would cross the content box's edge. A scale's pixel output
	 * is in the plot's own coordinates, margins included, so each point is
	 * shifted into the content box's before the check.
	 */
	const placements = $derived.by(() => {
		if (!marker.edgeAware || !points) return undefined;
		const canvasFont = `${fontSize}px ${cfg.font === 'inherit' ? 'sans-serif' : cfg.font}`;
		const box = bounds ?? { left: 0, top: 0, right: plot.plotWidth, bottom: plot.plotHeight };
		return displayData.map((d, i) =>
			resolveEdgeAwareAnchor({
				px: points[i].px - box.left,
				py: points[i].py - box.top,
				width: box.right - box.left,
				height: box.bottom - box.top,
				textAnchor,
				lineAnchor,
				gapX: Math.abs(dx),
				gapY: Math.abs(dy),
				extent: { width: measureTextWidth(textOf(d), canvasFont), height: fontSize * 1.2 }
			})
		);
	});

	const flipAnchor = (anchor: typeof textAnchor) =>
		anchor === 'start' ? 'end' : anchor === 'end' ? 'start' : anchor;

	let groupEl: SVGGElement | undefined = $state();

	watchLabelOverflow({
		el: () => (marker.onOverflow ? groupEl : undefined),
		bounds: () => {
			// getBBox() isn't tracked reactively — depend on the layout so a new one re-measures.
			void marker;
			void points;
			return bounds;
		},
		onOverflow: (overflow) => marker.onOverflow?.(overflow)
	});
</script>

{#snippet label(
	rows: TData[],
	rowDx: number,
	rowDy: number,
	rowAnchor: typeof textAnchor,
	rowLineAnchor: typeof lineAnchor
)}
	<Text
		data={rows}
		x={x ?? 0}
		y={y ?? 0}
		text={text ?? ''}
		dx={rowDx}
		dy={rowDy}
		fill={fill as never}
		fillOpacity={fillOpacity as never}
		{fontSize}
		{fontWeight}
		textAnchor={rowAnchor}
		lineAnchor={rowLineAnchor}
		fontStyle={fontStyleProp}
		lineHeight={styles?.lineHeight}
		rotate={styles?.rotate}
		stroke={styles?.stroke}
		strokeWidth={styles?.strokeWidth}
		paintOrder={styles?.paintOrder}
		class={styles?.class}
		textClass={styles?.textClass}
	/>
{/snippet}

{#snippet labels()}
	{#if !perRow}
		{@render label(displayData, dx, dy, textAnchor, lineAnchor)}
	{:else if (!declutter && !marker.edgeAware) || points}
		<!-- A decluttered or edge-aware label waits for both scales: placed early,
		     it can sit past the edge long enough for `onOverflow` to lock in a
		     margin it never needs. -->
		{#each displayData as d, i (i)}
			{@const lane = lanes?.get(i)}
			{@const placement = placements?.[i]}
			{@const extraDy = lane?.extraDy ?? 0}
			{@const laneDir = lane?.aligned ? lane.dir : dir}
			{@const labelDx = lane?.aligned ? laneDir * lane.reach : dx}
			{#if declutter && points && (lane?.aligned || extraDy !== 0)}
				{@const { px, py } = points[i]}
				{@const laneX = lane?.aligned ? px + laneDir * lane.laneReach : px + labelDx}
				{@const connector = declutter.connector}
				<path
					d={`M ${px} ${py} H ${laneX} V ${py + extraDy} H ${px + labelDx}`}
					fill="none"
					stroke={connector.stroke}
					stroke-width={connector.strokeWidth}
					stroke-opacity={connector.strokeOpacity ?? opacityOf(d) ?? 1}
					stroke-dasharray={connector.strokeDasharray}
					stroke-linecap={connector.strokeLinecap ?? 'square'}
					stroke-linejoin={connector.strokeLinejoin ?? 'miter'}
				/>
			{/if}
			<!-- svelteplot's Text never wires pointer handlers to its DOM node; a wrapping <g> catches them. -->
			<g
				role="presentation"
				onpointerenter={marker.onPointerEnter && (() => marker.onPointerEnter?.(d))}
				onpointerleave={marker.onPointerLeave && (() => marker.onPointerLeave?.(d))}
			>
				{#if placement}
					{@render label(
						[d],
						placement.dx,
						placement.dy + extraDy,
						placement.textAnchor,
						placement.lineAnchor
					)}
				{:else}
					{@render label(
						[d],
						labelDx,
						dy + extraDy,
						lane?.aligned && laneDir !== dir ? flipAnchor(textAnchor) : textAnchor,
						lineAnchor
					)}
				{/if}
			</g>
		{/each}
	{/if}
{/snippet}

{#if text}
	{#if marker.onOverflow}
		<g bind:this={groupEl}>{@render labels()}</g>
	{:else}
		{@render labels()}
	{/if}
{/if}
