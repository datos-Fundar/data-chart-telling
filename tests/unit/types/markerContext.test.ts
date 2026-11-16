import { describe, test, expect } from 'vitest';
import type { ComponentProps } from 'svelte';
import type SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import type TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import type HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import type BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import type BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { RowContextOf } from '$lib';

// Each `@ts-expect-error` is checked by `svelte-check`: the line below it must not type-check. A field no context has
// failing proves the context is no `any`; every callback below names no context type, the plot gives it.

type MarkersOf<T> = NonNullable<T extends { markers?: infer M } ? M : never>;

const own = [{ label: 'a', value: 1 }];

const sankey: MarkersOf<ComponentProps<typeof SankeyPlot>> = [
	{
		type: 'text',
		x: (row, context) => context.start!.column,
		y: (row, context) => context.start!.y,
		text: (row, context) => `${context.name} ${context.incoming.length}`,
		textAnchor: (row, context) => (context.kind === 'node' ? 'start' : 'end'),
		styles: { fill: (row, context) => (context.kind === 'link' ? 'gray' : 'black') },
		transforms: [{ type: 'filter', filter: (row, context) => context.kind === 'link' }]
	},
	{
		type: 'dot',
		r: (row, context) => context.value ?? 0,
		dx: (row, context) => context.index ?? 0
	},
	{ type: 'bar', role: 'segment', label: { text: (row, context) => context.source } },
	{ type: 'rule', axis: 'x', value: (row, context) => context.column },
	{ type: 'hover', format: (context) => context.name },
	// A marker with rows of its own reads the plot's context too.
	{ type: 'text', data: own, text: (row, context) => String(context.index) },
	// @ts-expect-error a sankey's context has no `path`.
	{ type: 'text', text: (row, context) => context.path }
];

const treemap: MarkersOf<ComponentProps<typeof TreemapPlot>> = [
	{ type: 'text', text: (row, context) => `${context.path.join(' / ')} ${context.share}` },
	// @ts-expect-error a treemap's context has no `incoming`.
	{ type: 'text', text: (row, context) => String(context.incoming) }
];

const histogram: MarkersOf<ComponentProps<typeof HistogramPlot>> = [
	{ type: 'text', text: (row, context) => `${context.from}-${context.to}: ${context.count}` }
];

const box: MarkersOf<ComponentProps<typeof BoxPlot>> = [
	{ type: 'dot', r: (row, context) => context.median }
];

const bar: MarkersOf<ComponentProps<typeof BarPlot>> = [
	{ type: 'text', text: (row, context) => `${context.series} ${context.value}` },
	// @ts-expect-error a bar's context is the shared one: it has no `share`.
	{ type: 'text', text: (row, context) => String(context.share) }
];

const geo: MarkersOf<ComponentProps<typeof GeoPlot>> = [
	{
		type: 'text',
		data: own,
		text: (row, context) => `${context.time ?? ''} ${context.facet?.value ?? ''}`
	},
	// @ts-expect-error a map's context has no `name`.
	{ type: 'text', data: own, text: (row, context) => context.name }
];

// `RowContextOf` names a plot's context from its component, where nothing ties the code to the plot.
// Only checked, never run.
const named = (bin: RowContextOf<typeof HistogramPlot>, link: RowContextOf<typeof SankeyPlot>) => [
	bin.from + bin.to + bin.count,
	link.incoming.length,
	// @ts-expect-error a histogram's context has no `share`.
	bin.share,
	// @ts-expect-error a sankey's context has no `median`.
	link.median
];

describe('the context of a marker of the author', () => {
	test("is the plot kind's own, without naming it", () => {
		expect([sankey, treemap, histogram, box, bar, geo].map((m) => m.length)).toEqual([
			7, 2, 1, 1, 2, 2
		]);
		expect(named).toBeTypeOf('function');
	});
});
