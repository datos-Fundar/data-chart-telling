import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `waffle` marker (svelteplot's own `WaffleX`/`WaffleY`) - a bar drawn as a
// grid of unit squares. Orientation is automatic like `bar`: `WaffleY` when `y`
// is quantitative and `x` a band, `WaffleX` otherwise - the category axis must
// be a band scale. `unit` is the quantity per square, `multiple` the squares
// per row, `gap` the pixel spacing, `round` avoids partial squares. Cells are
// only square when a bar spans many units (svelteplot derives the cell size
// from pixels-per-unit and picks `multiple` itself), so the demo values are in
// the hundreds - with a handful of units per bar the cells stretch into big
// rectangles. Likewise, an explicit `multiple` that doesn't match the plot's
// pixels per unit stretches the cells along the value axis instead of
// shrinking them to fit, so leave it unset and tune `unit` (vertical form
// only: svelteplot 0.14.2's `WaffleX` ignores `unit`). Demoed on an empty host with a band axis (same convention as
// `Markers/Box`).

const COUNTS = [
	{ region: 'Americas', count: 120 },
	{ region: 'Europe', count: 110 },
	{ region: 'Asia', count: 100 },
	{ region: 'Africa', count: 70 }
];

const YEARS = ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
const REGIONS = ['Americas', 'Europe', 'Asia', 'Africa'];

/** Countries counted per region and year - a bell-shaped total peaking around 2019-2020, like a histogram. */
const COUNTS_BY_YEAR = YEARS.flatMap((year, i) =>
	REGIONS.map((region, j) => ({
		year,
		region,
		count: Math.round(
			(12 + 10 * Math.exp(-(((i - 3.5) / 2) ** 2))) *
				(1 + 0.35 * ((j * 3 + i) % 4)) *
				(j === 2 ? 1.4 : 1)
		)
	}))
);

/** Survey answers: for each question, the share that answered yes; the rest answered no. Each question sums to 100. */
const SURVEY = [
	{ question: 'Stay home after dark', yes: 74 },
	{ question: 'Skip activities besides school', yes: 80 },
	{ question: 'Join political discussion', yes: 8 },
	{ question: 'Want to do more activities', yes: 61 }
].flatMap((d) => [
	{ question: d.question, answer: 'Yes', share: d.yes },
	{ question: d.question, answer: 'No', share: 100 - d.yes }
]);

const meta = {
	title: 'Markers/Waffle',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'region',
		y: 'count',
		scales: {
			x: { type: 'band', domain: COUNTS.map((d) => d.region) },
			y: { domain: [0, 160] }
		}
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One square per unit (`WaffleY`), 10 squares per row. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'waffle',
				data: COUNTS,
				x: 'region',
				y: 'count',
				multiple: 10,
				unit: 1
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `color` fills each region's waffle with its palette color; `gap` widens the spacing between squares. */
export const ColoredByRegion: Story = {
	args: {
		markers: [
			{
				type: 'waffle',
				data: COUNTS,
				x: 'region',
				y: 'count',
				color: 'region',
				multiple: 10,
				unit: 1
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Swapping the axes flips the marker to `WaffleX`; `unit` is ignored here by svelteplot 0.14.2, so only the automatic `multiple` keeps the cells square. */
export const Horizontal: Story = {
	args: {
		x: 'count',
		y: 'region',
		scales: {
			y: { type: 'band', domain: COUNTS.map((d) => d.region) },
			x: { domain: [0, 160] }
		},
		markers: [
			{
				type: 'waffle',
				data: COUNTS,
				x: 'count',
				y: 'region',
				color: 'region',
				styles: { borderRadius: 10 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A stacked histogram: one waffle per year, the rows of each region stacked on top of one another (svelteplot stacks rows that share `x`). */
export const StackedHistogram: Story = {
	args: {
		x: 'year',
		y: 'count',
		scales: {
			x: { type: 'band', domain: YEARS },
			y: { domain: [0, 160] }
		},
		markers: [
			{
				type: 'waffle',
				data: COUNTS_BY_YEAR,
				x: 'year',
				y: 'count',
				color: 'region',
				gap: 1
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** The horizontal counterpart - the same stack laid out along `x`, one waffle per year (`WaffleX`). */
export const StackedHorizontal: Story = {
	args: {
		height: 560,
		x: 'count',
		y: 'year',
		scales: {
			y: { type: 'band', domain: YEARS },
			x: { domain: [0, 160] }
		},
		markers: [
			{
				type: 'waffle',
				data: COUNTS_BY_YEAR,
				x: 'count',
				y: 'year',
				color: 'region',
				gap: 1
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A proportion of the whole: each question is a 10×10 waffle of rounded cells where the answers add up to 100% (orange = yes, gray = no). */
export const ProportionOfTheWhole: Story = {
	args: {
		height: 280,
		x: 'question',
		y: 'share',
		scales: {
			x: { type: 'band', domain: [...new Set(SURVEY.map((d) => d.question))] },
			y: { domain: [0, 100] }
		},
		markers: [
			{
				type: 'waffle',
				data: SURVEY,
				x: 'question',
				y: 'share',
				color: 'answer',
				multiple: 10,
				gap: 3,
				scales: { color: { scheme: { Yes: '#ffa500', No: '#555555' } } },
				styles: { borderRadius: 10 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
