<script lang="ts" generics="TData = Record<string, unknown>">
	import { RowStyle } from '$lib/markers/utils/RowStyle';
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Text } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { BandNudge } from '$lib/markers/utils/BandNudge';
	import { RowOffset } from '$lib/markers/utils/RowOffset';
	import RowOffsetMarks from '$lib/markers/utils/RowOffsetMarks.svelte';
	import { Declutter } from '$lib/markers/text/Declutter';
	import { Covering } from '$lib/markers/text/Covering';
	import { SvelteMap } from 'svelte/reactivity';
	import { TextFit, type FittedText } from '$lib/markers/text/TextFit';
	import { NumberFormat } from '$lib/utils/NumberFormat';
	import { PlotMargins } from '$lib/layout/margins/PlotMargins.svelte';
	import { Box } from '$lib/layout/margins/Box';
	import type { TextMarkerConfig } from '$lib/types/markers/common';
	import type { BoxChannels, BoxSizer } from '$lib/types/markers/labels/box';
	import type { TextAnchor } from '$lib/types/plots/constants';

	/**
	 * Renders one `'text'` marker. `x`/`y` also accept a literal number or Date. A number its `text`
	 * gives - a number, a numeric field of the rows, a function's result - is written as the marker's
	 * `decimals`, `prefix`, `suffix` and `signDisplay` (over the configuration's `numbers`) ask.
	 * A marker that declutters, flips at the edges or listens to the pointer
	 * draws one label per row, inside the plot's content box. With
	 * `fitMargins`, the plot's margins grow until the labels fit.
	 */
	const { marker, box }: { marker: TextMarkerConfig; box?: BoxChannels | BoxSizer } = $props();
	const events = MarkerEvents.use(() => marker);

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
	const numberText = $derived(NumberFormat.of(NumberFormat.displayOf(marker), cfg));
	const styles = $derived(marker.styles);

	// A label placed by a literal (or by the frame) draws once without rows; one placed by a field of its rows draws nothing.
	const placedByRows = (position: unknown) =>
		['string', 'function', 'symbol'].includes(typeof position);
	const displayData = $derived(
		data.length > 0 ? data : placedByRows(x) || placedByRows(y) ? [] : [{} as TData]
	);
	// Per-row accessors give literal values; an empty one takes the flat default.
	const fill = $derived.by(() => {
		const own = styles?.fill;
		if (typeof own !== 'function') return RowStyle.of(own, displayData) ?? 'currentColor';
		return { value: (d: TData) => own(d) ?? 'currentColor', scale: null };
	});
	const fillOpacity = $derived.by(() => {
		const own = styles?.fillOpacity;
		return typeof own === 'function'
			? { value: (d: TData) => own(d) ?? 1, scale: null }
			: RowStyle.opacity(own);
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
	const lineAnchor = $derived(
		(typeof marker.lineAnchor === 'function' ? undefined : marker.lineAnchor) ??
			styles?.lineAnchor ??
			'middle'
	);
	const lineAnchorAt = (d: TData) =>
		typeof marker.lineAnchor === 'function' ? marker.lineAnchor(d) : lineAnchor;
	// A label in a slice of its band sits off the band's middle, at its drawn width.
	const nudge = $derived(BandNudge.of(plot.scales, marker.bandSlice));
	// The fixed offset, which `declutter` and `edgeAware` place labels by; a function of the row moves each label after that, through `RowOffsetMarks`.
	const fixedOffset = $derived(
		RowOffset.whole(marker, { dx: styles?.dx ?? 0, dy: styles?.dy ?? 0 })
	);
	const dx = $derived(fixedOffset.dx + nudge.dx);
	const dy = $derived(fixedOffset.dy + nudge.dy);
	const anchorAt = (d: TData) =>
		typeof marker.textAnchor === 'function' ? anchorOf(marker.textAnchor(d)) : textAnchor;
	const projected = $derived(!!plot.scales.projection);

	const declutter = $derived.by(() => {
		if (!marker.declutter) return undefined;
		const own =
			marker.declutter === true
				? {}
				: typeof marker.declutter === 'string'
					? { mode: marker.declutter }
					: marker.declutter;
		const defaults = cfg.text.declutter;
		return {
			mode: own.mode ?? 'lanes',
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
			!!marker.origin ||
			events.any ||
			!!marker.covers ||
			typeof marker.textAnchor === 'function' ||
			typeof marker.lineAnchor === 'function'
	);
	/** Where a row's point sits off its `x`/`y`. */
	const originOf = (d: TData) => marker.origin?.(d, plot.scales) ?? { dx: 0, dy: 0 };
	const dir = $derived(Math.sign(dx) || 1);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function channel(value: unknown): (d: any) => unknown {
		if (typeof value === 'function') return value as (d: unknown) => unknown;
		// A field key: a name, or the symbol a transform keyed its output channel by.
		if (typeof value === 'string' || typeof value === 'symbol') return (d) => d?.[value];
		return () => value;
	}

	/** What a row's `text` comes to: a function's result, a field of the row, else the text itself. */
	function valueOf(d: TData): unknown {
		if (typeof text === 'function') return text(d);
		if (typeof text === 'string' && typeof d === 'object' && d !== null && text in d) {
			return (d as Record<string, unknown>)[text];
		}
		return text;
	}

	/** A row's text, a number written as the marker asks. */
	function textOf(d: TData): string {
		const value = valueOf(d);
		return typeof value === 'number' ? numberText(value) : String(value ?? '');
	}

	/** The pixel size of the box a row's label is fitted to - from the edges it names, or measured by the shape it labels. */
	const boxSizeOf = $derived.by(() => {
		const fit = marker.fit === true ? {} : marker.fit;
		if (!fit) return undefined;
		const own = typeof box === 'function' ? undefined : box;
		const [x1, x2, y1, y2] = [
			fit.x1 ?? own?.x1,
			fit.x2 ?? own?.x2,
			fit.y1 ?? own?.y1,
			fit.y2 ?? own?.y2
		];
		const xScale = plot.scales.x?.fn;
		const yScale = plot.scales.y?.fn;
		if (![x1, x2, y1, y2].includes(undefined)) {
			if (!xScale || !yScale) return undefined;
			const [left, right, top, bottom] = [x1, x2, y1, y2].map(channel);
			const span = (
				scale: typeof xScale,
				from: (d: TData) => unknown,
				to: (d: TData) => unknown,
				d: TData
			) => Math.abs(Number(scale(to(d) as never)) - Number(scale(from(d) as never)));
			return (d: TData) => ({
				width: span(xScale, left, right, d),
				height: span(yScale, top, bottom, d)
			});
		}
		return typeof box === 'function' ? (d: TData) => box(d, plot.scales as never) : undefined;
	});

	/**
	 * What each label is written as and at, fitted to its box (`fit`), less the padding. A label with no room is left
	 * out, with `undefined`; one with no box to measure is written as it is.
	 */
	const fitted = $derived.by(() => {
		const fit = marker.fit === true ? {} : marker.fit;
		if (!fit || !boxSizeOf) return undefined;
		const padding = fit.padding ?? cfg.text.label.padding;
		const measure = (text: string, size: number) => Box.ofText(text, size, cfg).width;
		const fallback = fit.fallback;
		const fallbackOf = (d: TData) => {
			// As `text` is: a function's result, a field of the row, else the text itself.
			const value =
				typeof fallback === 'function'
					? fallback(d)
					: typeof fallback === 'string' && typeof d === 'object' && d !== null && fallback in d
						? (d as Record<string, unknown>)[fallback]
						: fallback;
			return typeof value === 'number' ? numberText(value) : String(value);
		};
		// Built whole inside this derivation and never changed after it, so it has nothing to react to.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const out = new Map<TData, FittedText | undefined>();
		for (const d of displayData) {
			const size = boxSizeOf(d);
			out.set(
				d,
				size
					? TextFit.fit({
							text: textOf(d),
							fallback: fallback === undefined ? undefined : fallbackOf(d),
							width: size.width - 2 * padding,
							height: size.height - 2 * padding,
							fontSize,
							minFontSize: fit.minFontSize ?? cfg.text.label.minFontSize,
							lineHeight: styles?.lineHeight ?? 1.2,
							minLetters: fit.minLetters ?? cfg.text.label.minLetters,
							measure
						})
					: { text: textOf(d), fontSize }
			);
		}
		return out;
	});
	/** `rows` by the size their labels are written at: svelteplot takes one size for a mark, and a function of the row sets its scales off in a loop. */
	function sizeGroups(rows: TData[]): { size: number; rows: TData[]; texts?: string[] }[] {
		if (!fitted) return [{ size: fontSize, rows }];
		const bySize = new SvelteMap<number, { rows: TData[]; texts: string[] }>();
		for (const d of rows) {
			const own = fitted.get(d);
			const group = bySize.get(own?.fontSize ?? fontSize) ?? { rows: [], texts: [] };
			group.rows.push(d);
			group.texts.push(own?.text ?? '');
			bySize.set(own?.fontSize ?? fontSize, group);
		}
		return [...bySize].map(([size, group]) => ({ size, ...group }));
	}

	/** The rows with room for a label. */
	const shown = $derived(fitted ? displayData.filter((d) => fitted.get(d)) : displayData);

	function opacityOf(d: TData): number | undefined {
		const value = styles?.fillOpacity;
		if (typeof value === 'function') return value(d);
		return typeof value === 'string' ? (d as Record<string, number>)[value] : value;
	}

	/** Each row's pixel position, once both scales resolve. */
	const points = $derived.by(() => {
		const xScale = plot.scales.x?.fn;
		const yScale = plot.scales.y?.fn;
		if ((!declutter && !marker.edgeAware && !marker.covers) || !xScale || !yScale) return undefined;
		const xOf = channel(x ?? 0);
		const yOf = channel(y ?? 0);
		// A band's position is its start; a mark sits at its middle.
		const middle = (scale: typeof plot.scales.x) =>
			scale?.type === 'band' ? scale.fn.bandwidth() / 2 : 0;
		const [dx0, dy0] = [middle(plot.scales.x), middle(plot.scales.y)];
		return displayData.map((d) => {
			const origin = originOf(d);
			return {
				px: Number(xScale(xOf(d) as never)) + dx0 + origin.dx,
				py: Number(yScale(yOf(d) as never)) + dy0 + origin.dy
			};
		});
	});

	const lanes = $derived(
		declutter?.mode === 'lanes' && points && bounds
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

	/** The rows whose label a shape drawn after its own row covers: their labels are left out. */
	const covered = $derived.by(() => {
		const covers = marker.covers;
		if (!covers || !points) return undefined;
		const shapes = displayData.map((d, i) => {
			const shape = covers(d, plot.scales);
			if (!shape) return undefined;
			const { px, py } = points[i];
			const { width, height, round } = shape;
			return { box: new Box(px - width / 2, py - height / 2, width, height), round };
		});
		const labels = displayData.map((d, i) =>
			Box.ofText(textOf(d), fontSize, cfg).beside(
				{ x: points[i].px + dx, y: points[i].py + dy },
				{ x: TEXT_SIDES[anchorAt(d)], y: LINE_SIDES[lineAnchorAt(d)] }
			)
		);
		return Covering.hidden(labels, shapes);
	});

	/** Each row's spot around its point, `null` for a row with none free. */
	const around = $derived.by(() => {
		if (declutter?.mode !== 'around' || !points) return undefined;
		const within = bounds ?? Box.size(plot.plotWidth, plot.plotHeight);
		const spots = Declutter.around({
			items: points.map((p, key) => ({
				key,
				...p,
				box: Box.ofText(textOf(displayData[key]), fontSize, cfg)
			})),
			preferred: { x: TEXT_SIDES[textAnchor], y: LINE_SIDES[lineAnchor] },
			gap: Math.max(Math.abs(dx), Math.abs(dy)) || declutter.labelGap,
			bounds: within
		});
		return displayData.map((_, i) => {
			const spot = spots.get(i);
			return spot
				? {
						dx: spot.dx,
						dy: spot.dy,
						textAnchor: TEXT_ANCHORS[spot.anchor.x],
						lineAnchor: LINE_ANCHORS[spot.anchor.y]
					}
				: null;
		});
	});

	/** Each row's anchor and offset: on its spot around its point, else flipped where its text would cross the content box's edge. */
	const placements = $derived.by(() => {
		if (around) return around;
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
	const measured = $derived(!!plotMargins && (!!marker.onoverflow || !!marker.fitMargins));
	plotMargins?.watch(() => (measured ? groupEl : undefined), {
		grow: () => !!marker.fitMargins,
		onoverflow: (overflow) => marker.onoverflow?.(overflow),
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
		{#each sizeGroups(rows) as group (group.size)}
			<Text
				data={group.rows}
				x={x ?? (marker.frameAnchor ? undefined : 0)}
				y={y ?? (marker.frameAnchor ? undefined : 0)}
				frameAnchor={marker.frameAnchor}
				text={((d: TData, index: number) => {
					if (group.texts) return group.texts[index];
					const value = valueOf(d);
					return typeof value === 'number' ? numberText(value) : value;
				}) as (d: TData) => string}
				dx={projected ? 0 : rowDx}
				dy={projected ? 0 : rowDy}
				fill={fill as never}
				fillOpacity={fillOpacity as never}
				fontSize={group.size}
				{fontWeight}
				textAnchor={rowAnchor}
				lineAnchor={rowLineAnchor}
				fontStyle={fontStyleProp}
				lineHeight={styles?.lineHeight}
				rotate={styles?.rotate}
				stroke={RowStyle.of(styles?.stroke, rows)}
				strokeWidth={RowStyle.field(styles?.strokeWidth)}
				paintOrder={styles?.paintOrder}
				class={styles?.class}
				textClass={styles?.textClass}
			/>
		{/each}
	</g>
{/snippet}

{#snippet labels()}
	{#if !perRow}
		<RowOffsetMarks {marker} rows={shown}>
			{#snippet mark(rows)}
				{@render label(rows, dx, dy, textAnchor, lineAnchor)}
			{/snippet}
		</RowOffsetMarks>
	{:else if (!declutter && !marker.edgeAware) || points}
		<!-- A decluttered or edge-aware label waits for both scales. -->
		{#each displayData as d, i (i)}
			{#if (!fitted || fitted.get(d)) && placements?.[i] !== null && !covered?.has(i)}
				{@const lane = lanes?.get(i)}
				{@const placement = placements?.[i]}
				{@const extraDy = lane?.extraDy ?? 0}
				{@const laneDir = lane?.aligned ? lane.dir : dir}
				{@const labelDx = lane?.aligned ? laneDir * lane.reach : dx}
				{@const origin = originOf(d)}
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
				<g role="presentation" {...events.forRow(d, i)}>
					<RowOffsetMarks {marker} rows={[d]}>
						{#snippet mark(rows)}
							{#if placement}
								{@render label(
									rows,
									placement.dx + origin.dx,
									placement.dy + extraDy + origin.dy,
									placement.textAnchor,
									placement.lineAnchor
								)}
							{:else}
								{@render label(
									rows,
									labelDx + origin.dx,
									dy + extraDy + origin.dy,
									lane?.aligned && laneDir !== dir ? flipAnchor(anchorAt(d)) : anchorAt(d),
									lineAnchorAt(d)
								)}
							{/if}
						{/snippet}
					</RowOffsetMarks>
				</g>
			{/if}
		{/each}
	{/if}
{/snippet}

{#if text !== ''}
	{#if measured}
		<g bind:this={groupEl}>{@render labels()}</g>
	{:else}
		{@render labels()}
	{/if}
{/if}
