<script lang="ts">
	import Figure from '$lib/layout/figure/Figure.svelte';
	import BasePlotLayout from '$lib/layout/base/BasePlotLayout.svelte';
	import UsePlotReader from './UsePlotReader.svelte';
	import UseFigureReader from './UseFigureReader.svelte';

	const rows = [
		{ x: 1, y: 2 },
		{ x: 2, y: 4 }
	];
	const state = {
		hover: { active: true, points: [], label: () => '' },
		hoverPosition: { x: (d: Record<string, unknown>) => d.x as number, y: (d: Record<string, unknown>) => d.y as number },
		hoverRows: rows
	};
</script>

{#snippet header()}
	<UseFigureReader />
{/snippet}

{#snippet body({ width, height }: { width: number; height: number })}
	<BasePlotLayout {width} {height} {state}>
		<UsePlotReader />
	</BasePlotLayout>
{/snippet}

<Figure width={300} height={200} {header} hoverStrategy="x" hoverSync={false} {body} />
