<script lang="ts">
	import { untrack } from 'svelte';
	import type { ContinuousLegendSection } from '$lib/types/layout/legend';
	import { makeColorScale, resolveColorScale } from '$lib/utils/color';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { AxisNumberFormat } from '$lib/layout/legend/AxisNumberFormat';
	import { LegendState } from '$lib/layout/legend/LegendState.svelte';

	let { section }: { section: ContinuousLegendSection } = $props();

	const cfg = $derived(getConfiguration());
	const gradientId = `dct-grad-${Math.random().toString(36).slice(2)}`;
	const checkerId = `dct-checker-${Math.random().toString(36).slice(2)}`;
	const barWidth = $derived(section.width ?? 170);

	const fmt = $derived(section.format ?? AxisNumberFormat.of([section.min, section.max], cfg));
	const isInteractive = $derived(section.interactive?.enabled ?? false);

	// How far the default handle bleeds past its 0/1 track position, so the
	// track can be inset from `barWidth`'s edges by that much.
	let loHandleEl = $state<SVGRectElement>();
	const handleBleed = $derived(
		isInteractive && !section.interactive?.handle && loHandleEl
			? Math.ceil(loHandleEl.getBoundingClientRect().width / 2)
			: 0
	);
	const trackWidth = $derived(Math.max(0, barWidth - handleBleed * 2));
	function trackX(t: number): number {
		return handleBleed + t * trackWidth;
	}

	const svgHeight = $derived(cfg.legend.continuous.height);
	const barHeight = $derived(cfg.legend.continuous.barHeight);
	const barRadius = $derived(cfg.legend.continuous.barRadius);
	const opacityLook = $derived(cfg.legend.continuous.opacity);

	// Fill/opacity for the excluded-margin rects.
	const excludedStyle = $derived.by((): { fill: string; opacity: number } => {
		const d = section.interactive?.disabledStyle;
		if (d?.fill) return { fill: d.fill, opacity: d.fillOpacity ?? d.opacity ?? 1 };
		return { fill: 'currentColor', opacity: d?.fillOpacity ?? d?.opacity ?? 0.35 };
	});

	const tickPositions = $derived(
		isInteractive
			? []
			: (section.ticks ?? []).map((v) => ({
					v,
					t: (v - section.min) / (section.max - section.min || 1),
					label: fmt(v)
				}))
	);

	// ── Drag-to-narrow-margins ────────────────────────────────────────────────
	const interaction = LegendState.ensure();

	// Seeded once from the section's bounds.
	let lo = $state(untrack(() => section.min));
	let hi = $state(untrack(() => section.max));

	// Whether each handle was dragged; an untouched one follows the section's bounds.
	let loAdjusted = $state(false);
	let hiAdjusted = $state(false);

	// A dragged handle is re-clamped into the new bounds.
	$effect(() => {
		lo = loAdjusted ? Math.min(Math.max(lo, section.min), section.max) : section.min;
		hi = hiAdjusted ? Math.max(Math.min(hi, section.max), section.min) : section.max;
	});

	function toT(v: number): number {
		return (v - section.min) / (section.max - section.min || 1);
	}
	const loT = $derived(toT(lo));
	const hiT = $derived(toT(hi));

	const colorDomain = $derived.by((): [number, number] =>
		isInteractive && (section.interactive?.mode ?? 'filter') === 'rescale'
			? [lo, hi]
			: [section.min, section.max]
	);
	const colorScale = $derived(
		section.scheme !== undefined
			? resolveColorScale({ scheme: section.scheme, pivot: section.pivot }, colorDomain, [
					cfg.continuous.min,
					cfg.continuous.max
				])
			: makeColorScale(
					colorDomain[0],
					colorDomain[1],
					section.colorMin ?? cfg.continuous.min,
					section.colorMax ?? cfg.continuous.max
				)
	);

	const stops = $derived(
		Array.from({ length: 20 }, (_, i) => {
			const t = i / 19;
			const v = section.min + t * (section.max - section.min);
			return section.opacity
				? {
						offset: t * 100,
						color: section.colorMin ?? opacityLook.color,
						opacity: section.opacity[0] + t * (section.opacity[1] - section.opacity[0])
					}
				: { offset: t * 100, color: colorScale(v), opacity: 1 };
		})
	);

	$effect(() => {
		if (!isInteractive) return;
		interaction.range =
			lo <= section.min && hi >= section.max
				? null
				: {
						min: lo,
						max: hi,
						mode: section.interactive?.mode ?? 'filter',
						disabledStyle: section.interactive?.disabledStyle ?? {
							opacity: cfg.legend.disabledOpacity
						}
					};
	});

	// Mirrors an externally-set `interaction.range` into lo/hi.
	$effect(() => {
		if (!isInteractive) return;
		const range = interaction.range;
		if (range === null) {
			if (untrack(() => loAdjusted || hiAdjusted)) {
				loAdjusted = false;
				hiAdjusted = false;
			}
			return;
		}
		const [currentLo, currentHi] = untrack(() => [lo, hi]);
		if (range.min !== currentLo || range.max !== currentHi) {
			lo = range.min;
			hi = range.max;
			loAdjusted = true;
			hiAdjusted = true;
		}
	});

	function startDrag(which: 'lo' | 'hi') {
		return (event: PointerEvent) => {
			if (!isInteractive) return;
			event.preventDefault();
			if (which === 'lo') loAdjusted = true;
			else hiAdjusted = true;
			const target = event.currentTarget as SVGElement;
			target.setPointerCapture(event.pointerId);
			const startX = event.clientX;
			const startValue = which === 'lo' ? lo : hi;
			const valuePerPixel = (section.max - section.min) / trackWidth;

			function onMove(e: PointerEvent): void {
				const next = startValue + (e.clientX - startX) * valuePerPixel;
				if (which === 'lo') {
					lo = Math.max(section.min, Math.min(next, hi));
				} else {
					hi = Math.min(section.max, Math.max(next, lo));
				}
			}
			function onUp(e: PointerEvent): void {
				target.releasePointerCapture(e.pointerId);
				target.removeEventListener('pointermove', onMove);
				target.removeEventListener('pointerup', onUp);
				target.removeEventListener('pointercancel', onUp);
			}
			target.addEventListener('pointermove', onMove);
			target.addEventListener('pointerup', onUp);
			target.addEventListener('pointercancel', onUp);
		};
	}

	function resetHandle(which: 'lo' | 'hi') {
		return () => {
			if (which === 'lo') {
				lo = section.min;
				loAdjusted = false;
			} else {
				hi = section.max;
				hiAdjusted = false;
			}
		};
	}

	let loLabelWidth = $state(0);
	let hiLabelWidth = $state(0);

	const labelsOverlap = $derived(
		isInteractive &&
			cfg.legend.continuous.label.overlap.enabled &&
			(hiT - loT) * trackWidth - loLabelWidth - hiLabelWidth <
				cfg.legend.continuous.label.overlap.margin
	);
</script>

<div class="dct-continuous" style:width="{barWidth}px">
	<svg width={barWidth} height={svgHeight} style="overflow: visible">
		<defs>
			<linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
				{#each stops as s (s.offset)}
					<stop offset="{s.offset}%" stop-color={s.color} stop-opacity={s.opacity} />
				{/each}
			</linearGradient>
			{#if section.opacity}
				<pattern
					id={checkerId}
					width={opacityLook.checker.size * 2}
					height={opacityLook.checker.size * 2}
					patternUnits="userSpaceOnUse"
				>
					<rect width="100%" height="100%" fill={opacityLook.checker.light} />
					<rect
						width={opacityLook.checker.size}
						height={opacityLook.checker.size}
						fill={opacityLook.checker.dark}
					/>
					<rect
						x={opacityLook.checker.size}
						y={opacityLook.checker.size}
						width={opacityLook.checker.size}
						height={opacityLook.checker.size}
						fill={opacityLook.checker.dark}
					/>
				</pattern>
			{/if}
		</defs>
		{#if section.opacity}
			<rect
				x={handleBleed}
				width={trackWidth}
				height={barHeight}
				rx={barRadius}
				fill="url(#{checkerId})"
			/>
		{/if}
		<rect
			x={handleBleed}
			width={trackWidth}
			height={barHeight}
			rx={barRadius}
			fill="url(#{gradientId})"
		/>
		{#each tickPositions as tick (tick.v)}
			<rect class="dct-continuous__tick-mark" x={trackX(tick.t)} y={barHeight} />
		{/each}

		{#if isInteractive}
			{#if loT > 0}
				<rect
					x={handleBleed}
					y="0"
					width={loT * trackWidth}
					height={barHeight}
					rx={barRadius}
					fill={excludedStyle.fill}
					fill-opacity={excludedStyle.opacity}
				/>
			{/if}
			{#if hiT < 1}
				<rect
					x={trackX(hiT)}
					y="0"
					width={trackWidth - hiT * trackWidth}
					height={barHeight}
					rx={barRadius}
					fill={excludedStyle.fill}
					fill-opacity={excludedStyle.opacity}
				/>
			{/if}
			{#if section.interactive?.handle}
				{@render section.interactive.handle({
					which: 'lo',
					value: lo,
					position: loT,
					onpointerdown: startDrag('lo'),
					ondoubleclick: resetHandle('lo')
				})}
				{@render section.interactive.handle({
					which: 'hi',
					value: hi,
					position: hiT,
					onpointerdown: startDrag('hi'),
					ondoubleclick: resetHandle('hi')
				})}
			{:else}
				<rect
					class="dct-continuous__handle"
					bind:this={loHandleEl}
					x={trackX(loT)}
					y={barHeight / 2}
					onpointerdown={startDrag('lo')}
					ondblclick={resetHandle('lo')}
					role="slider"
					aria-label="Lower bound"
					aria-valuemin={section.min}
					aria-valuemax={hi}
					aria-valuenow={lo}
					tabindex="0"
				/>
				<rect
					class="dct-continuous__handle"
					x={trackX(hiT)}
					y={barHeight / 2}
					onpointerdown={startDrag('hi')}
					ondblclick={resetHandle('hi')}
					role="slider"
					aria-label="Upper bound"
					aria-valuemin={lo}
					aria-valuemax={section.max}
					aria-valuenow={hi}
					tabindex="0"
				/>
			{/if}
		{/if}
	</svg>

	<div class="dct-continuous__labels" style:width="{barWidth}px">
		{#if isInteractive}
			<span class="dct-continuous__tick-measure" aria-hidden="true" bind:clientWidth={loLabelWidth}
				>{fmt(lo)}</span
			>
			<span class="dct-continuous__tick-measure" aria-hidden="true" bind:clientWidth={hiLabelWidth}
				>{fmt(hi)}</span
			>
			<span
				class="dct-continuous__tick dct-continuous__tick--handle-lo"
				class:dct-continuous__tick--vertical={labelsOverlap}
				style:left="{trackX(loT)}px">{fmt(lo)}</span
			>
			<span
				class="dct-continuous__tick dct-continuous__tick--handle-hi"
				class:dct-continuous__tick--vertical={labelsOverlap}
				style:left="{trackX(hiT)}px">{fmt(hi)}</span
			>
		{:else}
			<span class="dct-continuous__edge dct-continuous__edge--start">{fmt(section.min)}</span>
			{#each tickPositions as tick (tick.v)}
				<span class="dct-continuous__tick" style:left="{trackX(tick.t)}px">{tick.label}</span>
			{/each}
			<span class="dct-continuous__edge dct-continuous__edge--end">{fmt(section.max)}</span>
		{/if}
	</div>
</div>

<style>
	.dct-continuous {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.dct-continuous__labels {
		position: relative;
		height: 1rem;
		font-size: var(--dct-continuous-label-size, 0.875rem);
		user-select: none;
	}
	.dct-continuous__edge {
		position: absolute;
		transform: rotate(var(--dct-continuous-label-rotate, 0deg));
	}
	.dct-continuous__edge--start {
		left: 0;
	}
	.dct-continuous__edge--end {
		right: 0;
	}
	.dct-continuous__tick {
		position: absolute;
		white-space: nowrap;
		transform: translateX(-50%) rotate(var(--dct-continuous-label-rotate, 0deg));
	}
	/* Anchored outward so the label grows into the bar. */
	.dct-continuous__tick--handle-lo,
	.dct-continuous__tick--handle-hi {
		font-weight: var(--dct-continuous-label-weight, 600);
	}
	.dct-continuous__tick--handle-lo {
		transform: rotate(var(--dct-continuous-label-rotate, 0deg));
	}
	.dct-continuous__tick--handle-hi {
		transform: translateX(-100%) rotate(var(--dct-continuous-label-rotate, 0deg));
	}
	/* Invisible, always-horizontal twin used only to measure a handle label's
     natural width (see `labelsOverlap` above) - never rendered. */
	.dct-continuous__tick-measure {
		position: absolute;
		visibility: hidden;
		white-space: nowrap;
		font-weight: var(--dct-continuous-label-weight, 600);
	}
	/* Handle labels that would collide read top to bottom, pivoting on their anchor. */
	.dct-continuous__tick--handle-lo.dct-continuous__tick--vertical,
	.dct-continuous__tick--handle-hi.dct-continuous__tick--vertical {
		transform-origin: left bottom;
		transform: rotate(var(--dct-continuous-label-overlap-rotate, 90deg));
	}
	/* Tick mark below the bar at each non-interactive tick's position. */
	.dct-continuous__tick-mark {
		width: var(--dct-continuous-tick-width, 1px);
		height: var(--dct-continuous-tick-length, 6px);
		fill: var(--dct-continuous-tick-color, currentColor);
		transform-box: fill-box;
		transform: translateX(-50%);
	}
	/* Draggable lo/hi handle. */
	.dct-continuous__handle {
		width: var(--dct-continuous-handle-width, 6px);
		height: var(--dct-continuous-handle-height, 20px);
		rx: var(--dct-continuous-handle-radius, 3px);
		fill: var(--dct-continuous-handle-fill, currentColor);
		stroke: var(--dct-continuous-handle-stroke, var(--dct-bg, #fff));
		stroke-width: var(--dct-continuous-handle-stroke-width, 1.5px);
		transform-box: fill-box;
		transform-origin: center;
		transform: translate(-50%, -50%);
		cursor: ew-resize;
		touch-action: none;
	}
	.dct-continuous__handle:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
