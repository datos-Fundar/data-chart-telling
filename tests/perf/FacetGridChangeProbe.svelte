<script lang="ts">
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';

	let {
		data,
		products,
		mode,
		onReady
	}: {
		data: Record<string, unknown>[];
		products: string[];
		mode: 'effect' | 'handler';
		onReady: (api: { setGrid: (rows: number, cols: number) => void }) => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	const settings = $state({ rows: 2, cols: 3, values: products.slice(0, 4) });

	// What a settings panel does: it resets the faceted values when the grid's capacity changes.
	let previousCap = settings.rows * settings.cols;
	$effect(() => {
		if (mode !== 'effect') return;
		const cap = settings.rows * settings.cols;
		if (cap === previousCap) return;
		previousCap = cap;
		settings.values = products.slice(0, cap);
	});

	// svelte-ignore state_referenced_locally
	onReady({
		setGrid(rows, cols) {
			settings.rows = rows;
			settings.cols = cols;
			if (mode === 'handler') settings.values = products.slice(0, rows * cols);
		}
	});

	const facet = $derived({
		by: 'product',
		columns: settings.cols,
		values: settings.values,
		scales: 'free-x' as const,
		axes: 'all' as const
	});
</script>

<BarPlot
	width={900}
	height={500}
	{data}
	x="value"
	y="region"
	color="sub"
	{facet}
	order={['divider', 'legend', 'plot']}
	legend={{ series: { interactive: { enabled: true, legendStyle: 'badge', showIcon: false } } }}
	timeline={{
		accessor: 'year',
		filterMode: 'exact',
		type: 'rule',
		show: false,
		progress: 1,
		interpolate: false,
		scales: 'free-x'
	}}
	transforms={[{ type: 'stackX' }]}
	styles={{ values: { show: false } }}
	scales={{ x: { grid: true, tickSize: 0, label: false, nice: false } }}
	markers={[{ type: 'hover', strategy: 'y' }]}
	tooltip={{ strategy: 'y', sync: true }}
/>
