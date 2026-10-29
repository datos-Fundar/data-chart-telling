import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { REGION_VALUES } from '$datasets';

// Each region's value split into two sectors.
const SECTORS = [
	{ sector: 'Goods', share: 0.8 },
	{ sector: 'Services', share: 1.4 }
];
const rows = REGION_VALUES.flatMap((row) =>
	SECTORS.map(({ sector, share }) => ({ ...row, sector, value: row.value * share }))
);

/**
 * `facet` on a marker or a segment limits it to the panels it names: a `by` value, or a list of them.
 * Without it, it applies to every panel.
 */
const meta = {
	title: 'Layout/Facets/Scoped markers and segments',
	component: LinePlot,
	parameters: { docs: { source: { name: 'LinePlot' } } },
	tags: ['autodocs'],
	args: {
		width: 900,
		height: 360,
		data: rows,
		x: 'date',
		y: 'value',
		color: 'sector',
		facet: { by: 'region', columns: 3 }
	},
	argTypes: {
		width: { control: { type: 'range', min: 400, max: 1000, step: 20 } },
		height: { control: { type: 'range', min: 300, max: 800, step: 20 } },
		data: { control: false },
		facet: { control: false },
		markers: { control: false },
		segments: { control: false }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A rule in one panel only. */
export const MarkerInOnePanel: Story = {
	args: { markers: [{ type: 'rule', axis: 'y', value: 10, facet: 'GBA' }] }
};

/** A marker in a list of panels. */
export const MarkerInSeveralPanels: Story = {
	args: { markers: [{ type: 'rule', axis: 'y', value: 10, facet: ['GBA', 'Northwest'] }] }
};

/** A series styled differently in one panel. */
export const SegmentInOnePanel: Story = {
	args: {
		segments: { Services: [{ facet: 'Cuyo', styles: { stroke: { strokeDasharray: '4 4' } } }] }
	}
};

/** A stretch of one series highlighted in one panel. */
export const SegmentStretchInOnePanel: Story = {
	args: {
		segments: {
			Goods: [
				{
					facet: 'GBA',
					areas: [
						{ x: { from: new Date(Date.UTC(2023, 9, 1)), to: new Date(Date.UTC(2024, 3, 1)) } }
					],
					styles: { stroke: { stroke: 'crimson', strokeWidth: 4 } }
				}
			]
		}
	}
};
