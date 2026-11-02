<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { usePlot } from '$lib/layout/plot/usePlot';

	/**
	 * The labels of a band y axis, each on the lines it was given. svelteplot's own axis joins the lines of a
	 * label with spaces, so an axis whose `tickFormat` gives several lines hides its labels and has them
	 * drawn here. The left margin grows to the widest line, as the axis does for its own labels.
	 */
	let {
		ticks,
		lines,
		tickSize,
		tickPadding,
		fontSize
	}: {
		ticks: unknown[];
		/** The lines of each tick, in the order of `ticks`. */
		lines: string[][];
		tickSize: number;
		tickPadding: number;
		fontSize: number;
	} = $props();

	const LINE_HEIGHT = 1.15;

	const plot = usePlot().svelteplot;
	const marginLeft = $derived(Number(plot.options.marginLeft) || 0);

	const placed = $derived(
		ticks.map((tick, i) => {
			const scale = plot.scales.y.fn;
			return {
				lines: lines[i] ?? [],
				y: Number(scale(tick as never)) + (scale.bandwidth?.() ?? 0) / 2
			};
		})
	);

	let labels: (SVGTextElement | undefined)[] = $state([]);

	const { autoMarginLeft } = getContext<{ autoMarginLeft: Writable<Map<string, number>> }>(
		'svelteplot/autoMargins'
	);
	const marginId = `dct-multiline-y-ticks-${Math.random().toString(36).slice(2)}`;

	$effect(() => {
		// Read so new labels or a new size measure again.
		void [lines, fontSize, tickSize, tickPadding];
		let frame: number | undefined;
		let cancelled = false;
		const measure = () => {
			if (cancelled) return;
			const widest = Math.max(
				0,
				...labels.map((label) => label?.getBoundingClientRect().width ?? 0)
			);
			const wanted = Math.ceil(widest) + Math.max(0, tickSize + tickPadding);
			untrack(() => {
				if ($autoMarginLeft.get(marginId) !== wanted) $autoMarginLeft.set(marginId, wanted);
			});
		};
		// Text measures right only once its fonts load.
		(document.fonts?.ready ?? Promise.resolve()).then(() => {
			if (!cancelled) frame = requestAnimationFrame(measure);
		});
		return () => {
			cancelled = true;
			if (frame !== undefined) cancelAnimationFrame(frame);
		};
	});
	$effect(() => () => {
		$autoMarginLeft.delete(marginId);
	});

	const x = $derived(marginLeft - tickSize - tickPadding);
</script>

<g class="dct-multiline-y-ticks">
	{#each placed as tick, i (i)}
		<text
			bind:this={labels[i]}
			{x}
			y={tick.y}
			text-anchor="end"
			font-size={fontSize}
			fill="currentColor"
		>
			{#each tick.lines as line, l (l)}
				<!-- The block of lines is centred on the tick: the first sits half the others above it. -->
				<tspan
					{x}
					dy={l === 0
						? `${0.32 - ((tick.lines.length - 1) / 2) * LINE_HEIGHT}em`
						: `${LINE_HEIGHT}em`}>{line}</tspan
				>
			{/each}
		</text>
	{/each}
</g>
