<script lang="ts" generics="TData = Record<string, unknown>">
	import { Text } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { BandNudge } from '$lib/markers/utils/BandNudge';
	import { Declutter } from '$lib/markers/text/Declutter';
	import { PlotMargins } from '$lib/layout/margins/PlotMargins.svelte';
	import { Box } from '$lib/layout/margins/Box';
	import type { TextMarkerConfig } from '$lib/types/markers/common';
	import type { TextAnchor } from '$lib/types/plots/constants';

	/**
	 * Renders one `'text'` marker. `x`/`y` also accept a literal number or Date.
	 * A marker that declutters, flips at the edges or listens to the pointer
	 * draws one label per row, inside the plot's content box. With
	 * `fitMargins`, the plot's margins grow until the labels fit.
	 */
	const { marker }: { marker: TextMarkerConfig } = $props();

	// A text's anchors as the side of its point it sits on, and back.
	const TEXT_SIDES = { start: 'after', middle: 'middle', end: 'before' } as const;
	const TEXT_ANCHORS = { after: 'start', middle: 'middle', before: 'end' } as const;
	const LINE_SIDES = { top: 'after', middle: 'middle', bottom: 'before' } as const;
	const LINE_ANCHORS = { after: 'top', middle: 'middle', before: 'bottom' } as const;

	const cfg = $derived(getConfiguration());
	const plot = usePlot().svelteplot;
	const plotMargins = PlotMargins.current();
	const bounds = $derived(plotMargins?.contentBox);

	const data = $derived((marker.data ?? []) as TData[]);
	const x = $derived(marker.x);
	const y = $derived(marker.y);
	const text = $derived(marker.text ?? '');
	const styles = $derived(marker.styles);

	// A label placed by a literal (or by the frame) draws once without rows; one placed by a field of its rows draws nothing.
	const placedByRows = (position: unknown) =>
		['string', 'function', 'symbol'].includes(typeof position);
	const displayData = $derived(
		data.length > 0 ? data : placedByRows(x) || placedByRows(y) ? [] : [{} as TData]
	);
	// Per-row accessors give literal values; an empty one takes the flat default.
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
	// An unresolved `'outside'` falls back to `'start'`.
	const anchorOf = (anchor: TextAnchor | undefined): Exclude<TextAnchor, 'outside'> =>
		anchor === 'outside' ? 'start' : (anchor ?? 'middle');
	const textAnchor = $derived(
		anchorOf(
			typeof marker.textAnchor === 'function'
				? undefined
				: (marker.textAnchor ?? styles?.textAnchor)
		)
	);
	const lineAnchor = $derived(styles?.lineAnchor ?? 'middle');
	// A label in a slice of its band sits off the band's middle, at its drawn width.
	const nudge = $derived(BandNudge.of(plot.scales, marker.bandSlice));
	// A per-row offset or anchor (a function of the row) is read where each label is drawn.
	const staticOffset = (own: number | ((d: never) => number) | undefined, style = 0) =>
		typeof own === 'function' ? 0 : (own ?? style);
	const dx = $derived(staticOffset(marker.dx, styles?.dx) + nudge.dx);
	const dy = $derived(staticOffset(marker.dy, styles?.dy) + nudge.dy);
	const dxOf = (d: TData) => (typeof marker.dx === 'function' ? marker.dx(d) + nudge.dx : dx);
	const dyOf = (d: TData) => (typeof marker.dy === 'function' ? marker.dy(d) + nudge.dy : dy);
	const anchorAt = (d: TData) =>
		typeof marker.textAnchor === 'function' ? anchorOf(marker.textAnchor(d)) : textAnchor;
	// Under a map projection svelteplot ignores a label's `dx`/`dy`, so the offset is a translate of the label.
	const projected = $derived(!!plot.scales.projection);

	const declutter = $derived.by(() => {
		if (!marker.declutter) return undefined;
		const own = marker.declutter === true ? {} : marker.declutter;
		const defaults = cfg.text.declutter;
		return {
			elbowGap: own.elbowGap ?? defaults.elbowGap,
			laneStep: own.laneStep ?? defaults.laneStep,
			labelGap: own.labelGap ?? defaults.labelGap,
			aligned: own.aligned,
			flip: own.flip,
			connector: { ...defaults.connector, ...own.connector }
		};
	});
	const perRow = $derived(
		!!declutter ||
			!!marker.edgeAware ||
			!!marker.onPointerEnter ||
			!!marker.onPointerLeave ||
			typeof marker.dx === 'function' ||
			typeof marker.dy === 'function' ||
			typeof marker.textAnchor === 'function'
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
		// A band's position is its start; a mark sits at its middle.
		const middle = (scale: typeof plot.scales.x) =>
			scale?.type === 'band' ? scale.fn.bandwidth() / 2 : 0;
		const [dx0, dy0] = [middle(plot.scales.x), middle(plot.scales.y)];
		return displayData.map((d) => ({
			px: Number(xScale(xOf(d) as never)) + dx0,
			py: Number(yScale(yOf(d) as never)) + dy0
		}));
	});

	const lanes = $derived(
		declutter && points && bounds
			? Declutter.buildLanes({
					items: points.map((p, key) => ({ key, ...p })),
					dx,
					fontSize,
					geometry: declutter,
					forceAligned: declutter.aligned,
					flip: declutter.flip,
					bounds
				})
			: undefined
	);

	/** Each row's anchor and offset, flipped where its text would cross the content box's edge. */
	const placements = $derived.by(() => {
		if (!marker.edgeAware || !points) return undefined;
		const within = bounds ?? Box.size(plot.plotWidth, plot.plotHeight);
		const anchor = { x: TEXT_SIDES[textAnchor], y: LINE_SIDES[lineAnchor] };
		const gap = { x: Math.abs(dx), y: Math.abs(dy) };
		return displayData.map((d, i) => {
			const point = { x: points[i].px, y: points[i].py };
			const flip = Box.ofText(textOf(d), fontSize, cfg).flipNear(point, anchor, within, gap);
			return {
				dx: flip.dx,
				dy: flip.dy,
				textAnchor: TEXT_ANCHORS[flip.anchor.x],
				lineAnchor: LINE_ANCHORS[flip.anchor.y]
			};
		});
	});

	const flipAnchor = (anchor: typeof textAnchor) =>
		anchor === 'start' ? 'end' : anchor === 'end' ? 'start' : anchor;

	let groupEl: SVGGElement | undefined = $state();

	// The plot measures what it draws: how far it reaches out, and with `fitMargins` its margins grow to fit it.
	const measured = $derived(!!plotMargins && (!!marker.onOverflow || !!marker.fitMargins));
	plotMargins?.watch(() => (measured ? groupEl : undefined), {
		grow: () => !!marker.fitMargins,
		onOverflow: (overflow) => marker.onOverflow?.(overflow),
		// The box isn't tracked reactively: a new layout measures again.
		deps: () => [marker, points]
	});
</script>

{#snippet label(
	rows: TData[],
	rowDx: number,
	rowDy: number,
	rowAnchor: typeof textAnchor,
	rowLineAnchor: typeof lineAnchor
)}
	<g transform={projected ? `translate(${rowDx},${rowDy})` : undefined}>
		<Text
			data={rows}
			x={x ?? (marker.frameAnchor ? undefined : 0)}
			y={y ?? (marker.frameAnchor ? undefined : 0)}
			frameAnchor={marker.frameAnchor}
			text={text ?? ''}
			dx={projected ? 0 : rowDx}
			dy={projected ? 0 : rowDy}
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
	</g>
{/snippet}

{#snippet labels()}
	{#if !perRow}
		{@render label(displayData, dx, dy, textAnchor, lineAnchor)}
	{:else if (!declutter && !marker.edgeAware) || points}
		<!-- A decluttered or edge-aware label waits for both scales. -->
		{#each displayData as d, i (i)}
			{@const lane = lanes?.get(i)}
			{@const placement = placements?.[i]}
			{@const extraDy = lane?.extraDy ?? 0}
			{@const laneDir = lane?.aligned ? lane.dir : dir}
			{@const labelDx = lane?.aligned ? laneDir * lane.reach : dxOf(d)}
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
						dyOf(d) + extraDy,
						lane?.aligned && laneDir !== dir ? flipAnchor(anchorAt(d)) : anchorAt(d),
						lineAnchor
					)}
				{/if}
			</g>
		{/each}
	{/if}
{/snippet}

{#if text}
	{#if measured}
		<g bind:this={groupEl}>{@render labels()}</g>
	{:else}
		{@render labels()}
	{/if}
{/if}
