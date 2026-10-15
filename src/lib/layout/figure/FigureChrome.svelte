<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PlotBoxSnippet } from '$lib/types/layout/figure';
	import type { PlotChromeItem } from '$lib/types/plots/props';
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
		header?: Snippet;
		footer?: Snippet;
		order?: readonly PlotChromeItem[];
		plot: PlotBoxSnippet;
	} = $props();

	type Block =
		| { type: 'heading'; key: string; items: ('title' | 'subtitle')[] }
		| { type: Exclude<PlotChromeItem, 'title' | 'subtitle'>; key: string };

	type DrawnItem = Exclude<PlotChromeItem, 'divider'>;

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

	/**
	 * `order`'s drawn blocks, once each, `plot` last when left out. Adjacent
	 * title and subtitle share one heading; a run of dividers draws one line,
	 * and only between two drawn blocks.
	 */
	const blocks = $derived.by(() => {
		const seen: DrawnItem[] = [];
		const items: PlotChromeItem[] = [];
		for (const item of resolvedOrder) {
			if (item !== 'divider' && (seen.includes(item) || !drawn(item))) continue;
			if (item !== 'divider') seen.push(item);
			items.push(item);
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
			const last = out.at(-1);
			if (item !== 'title' && item !== 'subtitle') out.push({ type: item, key: item });
			else if (last?.type === 'heading') last.items.push(item);
			else out.push({ type: 'heading', key: item, items: [item] });
		}
		return out;
	});

	let bodyWidth = $state(0);
	let bodyHeight = $state(0);

	// Stamp every `--dct-*` custom property on the root so the scoped styles below
	// (and any nested plot/legend/timeline) resolve them from the live config.
	const themeStyle = $derived(cssVarsStyle(configToCssVars(getConfiguration())));
</script>

<div class="dct-figure-chrome" style={themeStyle} style:width="{width}px" style:height="{height}px">
	{#each blocks as block (block.key)}
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
		{:else if block.type === 'divider'}
			<hr class="dct-figure-chrome__divider" />
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
