<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE } from '$datasets';

	const ERAS = [
		{ name: 'Early years', from: 1947, to: 1980 },
		{ name: 'Middle years', from: 1980, to: 2000 },
		{ name: 'Recent years', from: 2000, to: 2019 }
	];

	let menu = $state<{ name: string; x: number; y: number } | undefined>();
	let wrapper = $state<HTMLDivElement>();
</script>

<!-- Right-clicking an era opens a menu of our own, in place of the browser's. -->
<div bind:this={wrapper} style="position: relative">
	<LinePlot
		width={760}
		height={340}
		data={LIFE}
		x="year"
		y="value"
		color="sex"
		scales={{ y: { domain: [50, 85] } }}
		markers={[
			{
				type: 'rect',
				data: ERAS,
				x1: 'from',
				x2: 'to',
				y1: 50,
				y2: 85,
				styles: { insetLeft: 2, insetRight: 2, fill: 'seagreen', fillOpacity: 0.12 },
				oncontextmenu: (event, era) => {
					event.preventDefault();
					// The menu sits in the wrapper (a docs page moves `fixed` elements with its own transforms),
					// at the pointer's position within it.
					const { clientX, clientY } = event as MouseEvent;
					const box = wrapper!.getBoundingClientRect();
					menu = { name: era.name, x: clientX - box.left, y: clientY - box.top };
				}
			}
		]}
	/>

	{#if menu}
		<div
			role="menu"
			style="position: absolute; z-index: 10; left: {menu.x}px; top: {menu.y}px; background: #fff; color: #111; border: 1px solid #999; border-radius: 4px; padding: 6px 10px; font-size: 0.85rem; box-shadow: 0 2px 8px #0003"
		>
			{menu.name}
			<button type="button" style="margin-left: 8px" onclick={() => (menu = undefined)}
				>Close</button
			>
		</div>
	{/if}
</div>
