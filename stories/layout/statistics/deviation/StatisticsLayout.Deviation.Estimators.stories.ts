import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/ranking/dumbbell/Plot.svelte';
import { PROVINCE_VALUES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `estimator` picks the value the rule sits at (`mean`, `median`, `midrange`); `spread` what
// the band measures (`stdev`, or the outlier-resistant `mad`); `k` how many of them it reaches
// either side. `rule` and `band` style each, or are `false` to leave one out.

const meta = {
	title: 'Layout/Statistics/Deviation/Estimators',
	component: DumbbellPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_VALUES,
		x: 'value',
		y: 'province',
		color: 'sex'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		data: { control: false },
		statistics: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The median, with the median absolute deviation: neither moves much for an outlier. */
export const MedianAndMad: Story = {
	args: {
		statistics: [{ type: 'deviation', pooled: true, estimator: 'median', spread: 'mad' }]
	}
};

/** The midpoint of the lowest and highest value. */
export const Midrange: Story = {
	args: {
		statistics: [{ type: 'deviation', pooled: true, estimator: 'midrange' }]
	}
};

/** `k: 2` widens the band to two standard deviations either side. */
export const TwoDeviations: Story = {
	args: {
		statistics: [{ type: 'deviation', pooled: true, k: 2 }]
	}
};

/** `band: false` leaves just the rule at the mean. */
export const RuleOnly: Story = {
	args: {
		statistics: [
			{ type: 'deviation', band: false, rule: { strokeWidth: 2, strokeDasharray: '4 4' } }
		]
	}
};

/** `rule: false` leaves just the band, with a stroke along its edges. */
export const BandOnly: Story = {
	args: {
		statistics: [
			{
				type: 'deviation',
				rule: false,
				band: { fillOpacity: 0.1, stroke: '#6b7280', strokeDasharray: '2 3' }
			}
		]
	}
};
