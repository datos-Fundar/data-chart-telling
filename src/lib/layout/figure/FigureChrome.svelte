<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PlotBoxSnippet } from '$lib/types/layout/figure';
	import type { PlotChromeEntry, PlotChromeItem } from '$lib/types/plots/props';
	import {
		getConfiguration,
		configToCssVars,
		cssVarsStyle
	} from '$lib/configuration/config.svelte';

	/**
	 * A figure's chrome - a plot's or a composer's - drawn by its `Figure`. It owns the fixed footprint (`width`/`height`),
	 * lays out the header, optional legend and caption, and measures whatever
	 * space is left for the plot. The actual drawing is delegated to the `plot`
	 * snippet, which receives that measured box - so this component knows nothing
	 * about what kind of plot it wraps. `order` sets the blocks top to bottom
	 * (the configuration's `chrome.order` by default);
	 * a `header` replaces `title`/`subtitle` and a `footer` replaces `caption`,
	 * and a `divider` draws only between two drawn blocks.
	 */
	let {
		width,
		height,
		title,
		subtitle,
		caption,
		legend,
		timeline,
		timelineBesidePlot = false,
		header,
		footer,
		order,
		plot
	}: {
		width: number;
		height: number;
		title?: string;
		subtitle?: string;
		caption?: string;
		legend?: Snippet;
		timeline?: Snippet;
		/** Draws the timeline beside the plot, as if `order` had `'(plot, timeline)'` - unless a row of `order` already places them. */
		timelineBesidePlot?: boolean;
		header?: Snippet;
		footer?: Snippet;
		order?: readonly PlotChromeEntry[];
		plot: PlotBoxSnippet;
	} = $props();

	type DrawnItem = Exclude<PlotChromeItem, 'divider'>;

	/** A block drawn on its own, or as one cell of a row: a heading is the title and subtitle together. */
	type Cell =
		| { type: 'heading'; key: string; items: ('title' | 'subtitle')[] }
		| { type: Exclude<DrawnItem, 'title' | 'subtitle'>; key: string };

	type Block =
		| Cell
		| { type: 'divider'; key: string }
		| { type: 'row'; key: string; cells: Cell[] };

	/** Whether an item has anything to draw: `header` and `footer` win over the text they replace. */
	function drawn(item: DrawnItem): boolean {
		switch (item) {
			case 'title':
				return !header && !!title;
			case 'subtitle':
				return !header && !!subtitle;
			case 'header':
				return !!header;
			case 'legend':
				return !!legend;
			case 'timeline':
				return !!timeline;
			case 'caption':
				return !footer && !!caption;
			case 'footer':
				return !!footer;
			case 'plot':
				return true;
		}
	}

	/** The figure's own `order`, or the configuration's. */
	const resolvedOrder = $derived(order ?? getConfiguration().chrome.order);

	/** The blocks of a row written as `'(plot, timeline)'`, or `undefined` for any other entry. */
	function rowOf(entry: PlotChromeEntry): PlotChromeItem[] | undefined {
		if (!entry.startsWith('(') || !entry.endsWith(')')) return undefined;
		return entry
			.slice(1, -1)
			.split(',')
			.map((item) => item.trim() as PlotChromeItem);
	}

	/** `entries` with the timeline moved into the plot's row - or, written already in a row with the plot, left as the author put it. */
	function withTimelineBesidePlot(entries: readonly PlotChromeEntry[]): PlotChromeEntry[] {
		const rows = entries.map(rowOf);
		if (rows.some((row) => row?.includes('plot') && row.includes('timeline'))) return [...entries];
		let placed = false;
		const out = entries.flatMap((entry, i): PlotChromeEntry[] => {
			const row = rows[i];
			if (!row) {
				if (entry === 'timeline') return [];
				if (entry !== 'plot') return [entry];
				placed = true;
				return ['(plot, timeline)'];
			}
			const rest = row.filter((item) => item !== 'timeline');
			if (rest.includes('plot')) placed = true;
			const kept = rest.includes('plot') ? [...rest, 'timeline'] : rest;
			return kept.length ? [`(${kept.join(', ')})` as PlotChromeEntry] : [];
		});
		return placed ? out : [...out, '(plot, timeline)'];
	}

	/** `items` as cells, adjacent title and subtitle sharing one heading. */
	function cellsOf(items: DrawnItem[]): Cell[] {
		const cells: Cell[] = [];
		for (const item of items) {
			const last = cells.at(-1);
			if (item !== 'title' && item !== 'subtitle') cells.push({ type: item, key: item });
			else if (last?.type === 'heading') last.items.push(item);
			else cells.push({ type: 'heading', key: item, items: [item] });
		}
		return cells;
	}

	/**
	 * `order`'s drawn blocks, once each, `plot` last when left out. A row keeps
	 * its drawn blocks side by side (and is a plain block when only one is
	 * drawn); adjacent title and subtitle share one heading; a run of dividers
	 * draws one line, and only between two drawn blocks.
	 */
	const blocks = $derived.by(() => {
		const seen: DrawnItem[] = [];
		const items: (PlotChromeItem | DrawnItem[])[] = [];
		const take = (item: PlotChromeItem): item is DrawnItem =>
			item !== 'divider' && !seen.includes(item) && drawn(item) && !!seen.push(item);
		const placed = timelineBesidePlot ? withTimelineBesidePlot(resolvedOrder) : resolvedOrder;
		for (const entry of placed) {
			const row = rowOf(entry);
			if (!row) {
				const item = entry as PlotChromeItem;
				if (item === 'divider') items.push(item);
				else if (take(item)) items.push(item);
				continue;
			}
			const taken = row.filter(take);
			if (taken.length === 1) items.push(taken[0]);
			else if (taken.length > 1) items.push(taken);
		}
		if (!seen.includes('plot')) items.push('plot');

		const out: Block[] = [];
		let divided = false;
		for (const item of items) {
			if (item === 'divider') {
				divided = out.length > 0;
				continue;
			}
			if (divided) out.push({ type: 'divider', key: `divider-${out.length}` });
			divided = false;
			if (Array.isArray(item)) {
				out.push({ type: 'row', key: `row-${out.length}`, cells: cellsOf(item) });
				continue;
			}
			const last = out.at(-1);
			const [cell] = cellsOf([item]);
			if (cell.type === 'heading' && last?.type === 'heading') last.items.push(...cell.items);
			else out.push(cell);
		}
		return out;
	});

	let bodyWidth = $state(0);
	let bodyHeight = $state(0);

	// Stamp every `--dct-*` custom property on the root so the scoped styles below
	// (and any nested plot/legend/timeline) resolve them from the live config.
	const themeStyle = $derived(cssVarsStyle(configToCssVars(getConfiguration())));
</script>

{#snippet cell(block: Cell)}
	{#if block.type === 'heading'}
		<div class="dct-figure-chrome__header">
			{#each block.items as item (item)}
				{#if item === 'title'}
					<h3 class="dct-figure-chrome__title">{title}</h3>
				{:else}
					<span class="dct-figure-chrome__subtitle">{subtitle}</span>
				{/if}
			{/each}
		</div>
	{:else if block.type === 'header'}
		<div class="dct-figure-chrome__header">{@render header?.()}</div>
	{:else if block.type === 'legend'}
		<div class="dct-figure-chrome__legend">{@render legend?.()}</div>
	{:else if block.type === 'timeline'}
		<div class="dct-figure-chrome__timeline">{@render timeline?.()}</div>
	{:else if block.type === 'plot'}
		<div
			class="dct-figure-chrome__body"
			bind:clientWidth={bodyWidth}
			bind:clientHeight={bodyHeight}
		>
			{#if bodyWidth > 0 && bodyHeight > 0}
				{@render plot({ width: bodyWidth, height: bodyHeight })}
			{/if}
		</div>
	{:else if block.type === 'footer'}
		<div class="dct-figure-chrome__caption">{@render footer?.()}</div>
	{:else}
		<div class="dct-figure-chrome__caption">
			<span>{caption}</span>
		</div>
	{/if}
{/snippet}

<div class="dct-figure-chrome" style={themeStyle} style:width="{width}px" style:height="{height}px">
	{#each blocks as block (block.key)}
		{#if block.type === 'divider'}
			<hr class="dct-figure-chrome__divider" />
		{:else if block.type === 'row'}
			<div
				class="dct-figure-chrome__row"
				class:dct-figure-chrome__row--plot={block.cells.some((c) => c.type === 'plot')}
				class:dct-figure-chrome__row--timeline={block.cells.some((c) => c.type === 'timeline')}
			>
				{#each block.cells as inRow (inRow.key)}
					{@render cell(inRow)}
				{/each}
			</div>
		{:else}
			{@render cell(block)}
		{/if}
	{/each}
</div>

<style>
	.dct-figure-chrome {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		max-width: 100%;
		max-height: 100%;
		padding: var(--dct-bleed, 12px);
		overflow: hidden;
		color: var(--dct-fg, currentColor);
		background: var(--dct-bg, transparent);
		font-family: var(--dct-font, inherit);
	}

	.dct-figure-chrome__header {
		flex: 0 0 auto;
		padding: var(--dct-header-pad, 0.75rem 0 1rem);
	}

	.dct-figure-chrome__divider {
		flex: 0 0 auto;
		margin: var(--dct-divider-margin, 0);
		border: none;
		border-top: var(--dct-divider-width, 1px) var(--dct-divider-style, solid)
			var(--dct-divider-color, color-mix(in srgb, currentColor 15%, transparent));
	}

	.dct-figure-chrome__title {
		margin: 0 0 0.4rem;
		font-family: var(--dct-title-font, inherit);
		font-size: var(--dct-title-size, 1.5rem);
		font-weight: var(--dct-title-weight, 500);
		line-height: var(--dct-title-leading, 1.2);
		letter-spacing: var(--dct-title-spacing, normal);
		color: var(--dct-title-color, inherit);
	}

	.dct-figure-chrome__subtitle {
		font-family: var(--dct-subtitle-font, inherit);
		font-size: var(--dct-subtitle-size, 1rem);
		font-weight: var(--dct-subtitle-weight, 400);
		line-height: var(--dct-subtitle-leading, 1.3);
		letter-spacing: var(--dct-subtitle-spacing, normal);
		color: var(--dct-subtitle-color, inherit);
	}

	.dct-figure-chrome__legend {
		flex: 0 0 auto;
		padding: var(--dct-legend-pad, 0.75rem 0);
	}

	.dct-figure-chrome__timeline {
		flex: 0 0 auto;
		padding: var(--dct-timeline-pad, 0.5rem 0);
	}

	.dct-figure-chrome__row {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		gap: var(--dct-row-gap, 1rem);
		min-width: 0;
	}
	.dct-figure-chrome__row--plot {
		flex: 1 1 auto;
		align-items: stretch;
		min-height: 0;
	}
	/* In a row, what isn't the plot takes the width it needs, shrinking before the plot does. */
	.dct-figure-chrome__row > * {
		flex: 0 1 auto;
		min-width: 0;
	}
	.dct-figure-chrome__row > .dct-figure-chrome__body {
		flex: 1 1 0;
	}
	/* Beside the plot, the timeline keeps the configuration's own gap and lines up with it. */
	.dct-figure-chrome__row--timeline {
		gap: var(--dct-timeline-gap, 12px);
	}
	.dct-figure-chrome__row > .dct-figure-chrome__timeline {
		padding: 0;
	}

	.dct-figure-chrome__body {
		flex: 1 1 auto;
		min-height: 0;
		min-width: 0;
	}

	.dct-figure-chrome__caption {
		flex: 0 0 auto;
		padding: var(--dct-caption-pad, 0.5rem 0);
		font-family: var(--dct-caption-font, inherit);
		font-size: var(--dct-caption-size, 0.75rem);
		font-weight: var(--dct-caption-weight, 400);
		line-height: var(--dct-caption-leading, 1.3);
		letter-spacing: var(--dct-caption-spacing, normal);
		color: var(--dct-caption-color, inherit);
		white-space: pre-line;
	}
</style>
