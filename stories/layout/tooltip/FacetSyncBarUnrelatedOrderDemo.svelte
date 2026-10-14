<script lang="ts" module>
	export type GroupValue = { category: string; group: 'Group 1' | 'Group 2'; value: number };

	// Independent values per group, so sorting each facet by its own value gives two unrelated orderings.
	const GROUP_1: Record<string, number> = { A: 15, B: 42, C: 8, D: 61, E: 27, F: 50 };
	const GROUP_2: Record<string, number> = { A: 33, B: 12, C: 58, D: 20, E: 45, F: 5 };

	export const UNRELATED_SORT_DATA: GroupValue[] = Object.keys(GROUP_1).flatMap((category) => [
		{ category, group: 'Group 1' as const, value: GROUP_1[category] },
		{ category, group: 'Group 2' as const, value: GROUP_2[category] }
	]);
</script>

<script lang="ts">
	import BarPlot from '$lib/plots/bar/Plot.svelte';

	// Zero-prop marker - keeps Storybook's render typing happy.
	const props = $props();
	void props;
</script>

<BarPlot
	width={680}
	height={440}
	title="Value by category, two unrelated groups"
	subtitle="Strategy: y · Sync: on - each facet sorted by its own value"
	data={UNRELATED_SORT_DATA}
	x="value"
	y={'category' as keyof GroupValue}
	scales={{
		y: { sort: (a: GroupValue, b: GroupValue) => a.value - b.value }
	}}
	facet={{ by: 'group' as keyof GroupValue, columns: 2 }}
	tooltip={{
		strategy: 'y',
		sync: true,
		format: (row) => {
			const { category, value } = row as GroupValue;
			return `${category}: ${value}`;
		}
	}}
	markers={[{ type: 'hover' }]}
/>
