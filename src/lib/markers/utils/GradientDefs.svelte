<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { Gradient, type GradientDef } from '$lib/markers/utils/Gradient';
	import { GradientAlign } from '$lib/markers/utils/GradientAlign';

	/**
	 * Draws the gradients a marker's paints name (`Paint`), each as a `<linearGradient>`. One that spans its shape runs
	 * across each shape's own box; one that spans the plot runs across the plot's range on its axis, top to bottom
	 * on `y`, with its stops at values placed by the axis' scale.
	 */
	let { paints }: { paints: { defs: GradientDef[] }[] } = $props();
	const defs = $derived(paints.flatMap((paint) => paint.defs));
	const plot = usePlot().svelteplot;

	/** The pixels the plot spans on an axis, from its left or top. */
	const spanOf = (axis: 'x' | 'y'): [number, number] => {
		const range = (plot.scales[axis]?.range ?? [0, 0]).map(Number);
		return [Math.min(...range), Math.max(...range)];
	};

	/** Where a value sits on an axis, as a share of the plot's span on it: the middle of its band on a band axis. */
	const projectOn = (axis: 'x' | 'y') => {
		const scale = plot.scales[axis];
		const [from, to] = spanOf(axis);
		return (value: unknown) => {
			if (!scale || to === from) return undefined;
			const band = scale.type === 'band' ? Number(scale.fn.bandwidth()) / 2 : 0;
			return (Number(scale.fn(value as never)) + band - from) / (to - from);
		};
	};

	const drawn = $derived(
		defs.map((def) => {
			const along = def.axis === 'x';
			const [from, to] = def.span === 'plot' ? spanOf(def.axis) : [0, 1];
			return {
				id: def.id,
				units: def.span === 'plot' ? 'userSpaceOnUse' : 'objectBoundingBox',
				x1: along ? from : 0,
				x2: along ? to : 0,
				y1: along ? 0 : from,
				y2: along ? 0 : to,
				stops: Gradient.offsets(def.stops, projectOn(def.axis))
			};
		})
	);
	/**
	 * The gradients that span the plot, kept lined up with it on shapes a mark moves into place (`GradientAlign`):
	 * drawn again, they are lined up again.
	 */
	const plotWide = $derived(
		drawn.filter((gradient) => gradient.units === 'userSpaceOnUse').map((gradient) => gradient.id)
	);
</script>

{#if drawn.length}
	<defs {@attach GradientAlign.of(plotWide)}>
		{#each drawn as gradient (gradient.id)}
			<linearGradient
				id={gradient.id}
				gradientUnits={gradient.units}
				x1={gradient.x1}
				x2={gradient.x2}
				y1={gradient.y1}
				y2={gradient.y2}
			>
				{#each gradient.stops as { stop, offset }, i (i)}
					<stop {offset} stop-color={stop.color} stop-opacity={stop.opacity} />
				{/each}
			</linearGradient>
		{/each}
	</defs>
{/if}
