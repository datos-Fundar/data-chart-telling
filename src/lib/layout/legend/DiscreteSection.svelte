<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { paletteColor } from '$lib/utils/color';
	import {
		getLegendInteraction,
		createLegendInteraction
	} from '$lib/layout/legend/interaction.svelte';
	import type {
		DiscreteLegendSection,
		LegendItem,
		LegendNavDirection
	} from '$lib/types/layout/legend';
	import type { LineStyle } from '$lib/types/plots/constants';

	let { section }: { section: DiscreteLegendSection } = $props();

	const cfg = $derived(getConfiguration());
	const layout = $derived(section.layout ?? { type: 'vertical' as const });
	const isHorizontal = $derived(layout.type === 'horizontal');
	const maxRows = $derived(layout.type === 'horizontal' ? Math.max(1, layout.maxRows ?? 1) : 1);
	const columns = $derived(section.columns ?? 1);
	const interaction = getLegendInteraction() ?? createLegendInteraction();

	const seeded = new SvelteSet<string>();
	$effect(() => {
		for (const item of section.items) {
			if (seeded.has(item.name)) continue;
			seeded.add(item.name);
			if (item.disabled) {
				interaction.disabledSeries.set(
					item.name,
					section.disabledStyle ?? { opacity: cfg.legend.disabledOpacity }
				);
			}
		}
	});

	function toggle(item: LegendItem): void {
		if (!section.interactive) return;
		if (interaction.disabledSeries.has(item.name)) {
			interaction.disabledSeries.delete(item.name);
		} else {
			interaction.disabledSeries.set(
				item.name,
				section.disabledStyle ?? { opacity: cfg.legend.disabledOpacity }
			);
		}
	}

	function onKeydown(event: KeyboardEvent, item: LegendItem): void {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		toggle(item);
	}

	function dashArray(style?: LineStyle): string | undefined {
		switch (style) {
			case 'dashed':
				return '2,5';
			case 'dotted':
				return '1,4';
			case 'dashdot':
				return '5,3,1,3';
			default:
				return undefined;
		}
	}

	// ── Horizontal pagination ──────────────────────────────────────────────
	// Rows are discovered by measuring where each item actually lands (its
	// `offsetTop`) in a full, hidden copy of the list, laid out *in normal
	// flow* right alongside the visible (paginated) one rather than
	// `position: absolute`. That in-flow placement is deliberate, not
	// incidental: an absolutely-positioned element is excluded from its
	// ancestors' own width calculations, so once pagination narrowed the
	// visible box down to one or two items, every ancestor up to the legend
	// section — which sizes itself to fit its content, not the other way
	// around — shrank down to hug that now-narrow content instead of staying
	// pinned at the section's actual available width. Each further
	// remeasurement then ran at that smaller width, wrapping even fewer
	// items per row and shrinking again — a runaway feedback loop that read
	// as items "disappearing" into ever-smaller pages. Keeping the full
	// (wide) measurer in flow means its width, not the narrow visible page's,
	// is what ancestors size against — `height: 0; overflow: hidden` below
	// then clips away the vertical space it would otherwise take, so only
	// its width — never its height — affects the layout, and the legend
	// still visually shrinks the moment pagination reduces what's shown.
	let measurerEl: HTMLDivElement | undefined = $state();
	// Resize trigger only, so a later container resize re-runs the effect —
	// its value isn't otherwise used (see the effect body).
	let containerWidth = $state(0);
	let rows = $state<number[][]>([]);

	$effect(() => {
		if (!isHorizontal || !measurerEl) {
			rows = [];
			return;
		}
		void section.items;
		void containerWidth;
		const children = Array.from(measurerEl.children) as HTMLElement[];
		const grouped: number[][] = [];
		let lastTop = Number.NaN;
		for (let i = 0; i < children.length; i++) {
			const top = children[i].offsetTop;
			if (top !== lastTop) {
				grouped.push([i]);
				lastTop = top;
			} else {
				grouped[grouped.length - 1].push(i);
			}
		}
		rows = grouped;
	});

	const totalPages = $derived(isHorizontal ? Math.max(1, Math.ceil(rows.length / maxRows)) : 1);
	let page = $state(0);
	$effect(() => {
		if (page > totalPages - 1) page = Math.max(0, totalPages - 1);
	});

	const showNav = $derived(isHorizontal && totalPages > 1);

	const visibleItems = $derived.by((): { item: LegendItem; i: number }[] => {
		const all = section.items.map((item, i) => ({ item, i }));
		if (!isHorizontal || rows.length === 0) return all;
		const start = page * maxRows;
		const end = Math.min(rows.length, start + maxRows);
		// `rows` entries are already index-ascending, so flattening the page's
		// row slice preserves item order without needing a lookup set.
		return rows
			.slice(start, end)
			.flat()
			.map((i) => all[i]);
	});

	function prevPage(): void {
		page = Math.max(0, page - 1);
	}
	function nextPage(): void {
		page = Math.min(totalPages - 1, page + 1);
	}
</script>

{#snippet discreteItem(item: LegendItem, i: number)}
	{@const disabledStyle = interaction.disabledSeries.get(item.name)}
	{@const color =
		disabledStyle?.fill ??
		disabledStyle?.stroke?.stroke ??
		item.color ??
		paletteColor(i, cfg.palette)}
	{@const itemOpacity = disabledStyle
		? (disabledStyle.opacity ?? cfg.legend.disabledOpacity)
		: (item.opacity ?? 1)}
	<div
		class="dct-discrete__item"
		class:dct-discrete__item--interactive={section.interactive}
		style:opacity={itemOpacity}
		{...section.interactive
			? {
					role: 'button',
					tabindex: 0,
					'aria-pressed': disabledStyle != null,
					onclick: () => toggle(item),
					onkeydown: (e: KeyboardEvent) => onKeydown(e, item)
				}
			: {}}
	>
		<svg class="dct-discrete__swatch" viewBox="0 0 15 10">
			{#if item.symbol === 'circle'}
				<circle cx="5" cy="5" r="4" fill={color} />
			{:else if item.symbol === 'square'}
				<rect x="1" y="1" width="8" height="8" rx="2" fill={color} />
			{:else if item.symbol === 'triangle'}
				<path
					d="M 6 2 L 9 7.5 A 1.5 1.5 0 0 1 7.8 10 L 2.2 10 A 1.5 1.5 0 0 1 1 7.5 L 4 2 A 1.5 1.5 0 0 1 6 2"
					fill={color}
					transform="translate(0,-1)"
				/>
			{:else if item.symbol === 'line'}
				<line
					x1="2"
					y1="5"
					x2="13"
					y2="5"
					stroke={color}
					stroke-width="3"
					stroke-linecap="round"
					stroke-dasharray={dashArray(item.lineStyle)}
				/>
			{:else}
				<rect x="1" y="1" width="8" height="8" fill={color} />
			{/if}
		</svg>
		<span class="dct-discrete__label">{item.label || item.name}</span>
	</div>
{/snippet}

{#snippet navButtonSlot(
	direction: LegendNavDirection,
	disabled: boolean,
	onclick: () => void,
	label: string
)}
	{#if section.navButton}
		{@render section.navButton({ direction, disabled, onclick })}
	{:else}
		<button
			type="button"
			class="dct-discrete-paginated__btn"
			{disabled}
			{onclick}
			aria-label={label}
		>
			{direction === 'prev' ? '‹' : '›'}
		</button>
	{/if}
{/snippet}

{#if isHorizontal}
	<div class="dct-discrete-paginated">
		{#if showNav}
			{@render navButtonSlot('prev', page === 0, prevPage, 'Página anterior de referencias')}
		{/if}
		<div class="dct-discrete-horizontal" bind:clientWidth={containerWidth}>
			<div class="dct-discrete dct-discrete--horizontal">
				{#each visibleItems as { item, i } (item.name)}
					{@render discreteItem(item, i)}
				{/each}
			</div>
			<div
				class="dct-discrete dct-discrete--horizontal dct-discrete--measure"
				bind:this={measurerEl}
				aria-hidden="true"
			>
				{#each section.items as item, i (item.name)}
					{@render discreteItem(item, i)}
				{/each}
			</div>
		</div>
		{#if showNav}
			{@render navButtonSlot(
				'next',
				page >= totalPages - 1,
				nextPage,
				'Página siguiente de referencias'
			)}
		{/if}
	</div>
{:else}
	<div class="dct-discrete" style:grid-template-columns="repeat({columns}, max-content)">
		{#each section.items as item, i (item.name)}
			{@render discreteItem(item, i)}
		{/each}
	</div>
{/if}

<style>
	.dct-discrete {
		display: grid;
		column-gap: 1.25rem;
		row-gap: 0.4rem;
		max-width: 100%;
	}
	.dct-discrete--horizontal {
		display: flex;
		flex-wrap: wrap;
	}
	/* Items keep their natural (max-content) width and wrap to a new row
     instead of shrinking/truncating — matching the grid variant, where
     `grid-template-columns: repeat(n, max-content)` never shrinks a column
     either. Without this, flex's default `flex-shrink: 1` would cram every
     item onto one line by squeezing labels down via their own
     `overflow: hidden` before ever wrapping. */
	.dct-discrete--horizontal .dct-discrete__item {
		flex-shrink: 0;
	}
	/* Flanks the rows with the prev/next buttons (when present) instead of
	   stacking them below — `align-items: center` keeps each button centered
	   against the full block of rows, not pinned to its first/last row. */
	.dct-discrete-paginated {
		display: flex;
		align-items: center;
		gap: var(--dct-legend-nav-gap, 0.35rem);
	}
	.dct-discrete-horizontal {
		flex: 1 1 auto;
		min-width: 0;
	}
	/* Full, untruncated copy of the list used only to measure row breaks — kept
     in normal flow (see the long comment on the measurement effect for why
     it must NOT be `position: absolute` here), with its height collapsed to
     0 and clipped so it never adds any visible space of its own. Reading
     `offsetTop` off its children still works: `overflow: hidden` only clips
     what's *painted*, not each child's actual computed layout position. */
	.dct-discrete--measure {
		height: 0;
		overflow: hidden;
		visibility: hidden;
		pointer-events: none;
	}
	.dct-discrete__item {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;
		transition: opacity 0.15s ease;
	}
	.dct-discrete__item--interactive {
		cursor: pointer;
	}
	.dct-discrete__item--interactive:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
	.dct-discrete__swatch {
		width: var(--dct-legend-swatch, 1.25rem);
		height: var(--dct-legend-swatch, 1.25rem);
		flex-shrink: 0;
	}
	.dct-discrete__label {
		font-size: var(--dct-legend-size, 0.875rem);
		font-weight: var(--dct-legend-weight, 400);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.dct-discrete-paginated__btn {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border: none;
		border-radius: var(--dct-legend-nav-radius, 999px);
		width: var(--dct-legend-nav-size, 1.5rem);
		height: var(--dct-legend-nav-size, 1.5rem);
		padding: 0;
		font-size: var(--dct-legend-nav-font-size, 1rem);
		line-height: 1;
		background: var(--dct-legend-nav-bg, transparent);
		color: var(--dct-legend-nav-color, currentColor);
		cursor: pointer;
	}
	.dct-discrete-paginated__btn:hover:not(:disabled) {
		background: var(--dct-legend-nav-hover-bg, color-mix(in srgb, currentColor 10%, transparent));
	}
	.dct-discrete-paginated__btn:disabled {
		opacity: var(--dct-legend-nav-disabled-opacity, 0.3);
		cursor: default;
	}
</style>
