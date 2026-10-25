import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/ranking/dumbbell/Plot.svelte';
import { PROVINCE_VALUES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `label` on the rule or the band writes its name against the plot's edge, along the line. Its
// `styles` are a `FontStyle`: size, weight, color, offsets. The rule's label defaults to the
// estimator's name; the band's, inside its upper edge unless `edge` and `position` say otherwise, to the spread's.

const meta = {
	title: 'Layout/Statistics/Deviation/Labels',
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

/** `label: true` on both, with the defaults: `MEAN` on the rule, `STDEV` on the band's upper edge. */
export const Defaults: Story = {
	args: {
		statistics: [
			{
				type: 'deviation',
				pooled: true,
				rule: { stroke: '#0f766e', label: true },
				band: { fill: '#0f766e', label: true }
			}
		]
	}
};

/** Upright, the labels end at the plot's right edge, above their lines. */
export const Upright: Story = {
	args: {
		x: 'province',
		y: 'value',
		statistics: [
			{
				type: 'deviation',
				pooled: true,
				rule: { stroke: '#0f766e', label: true },
				band: { fill: '#0f766e', label: true }
			}
		]
	}
};

/** `edge` picks which edge of the band the label names, `position` whether it sits `inside` the band (the default) or `outside` it: all four, over one band. */
export const EdgesAndPositions: Story = {
	args: {
		statistics: [
			{
				type: 'deviation',
				pooled: true,
				rule: false,
				band: { fill: '#0f766e', label: { text: 'upper, inside' } }
			},
			{
				type: 'deviation',
				pooled: true,
				rule: false,
				band: { fillOpacity: 0, label: { text: 'lower, inside', edge: 'lower' } }
			},
			{
				type: 'deviation',
				pooled: true,
				rule: false,
				band: { fillOpacity: 0, label: { text: 'upper, outside', position: 'outside' } }
			},
			{
				type: 'deviation',
				pooled: true,
				rule: false,
				band: {
					fillOpacity: 0,
					label: { text: 'lower, outside', edge: 'lower', position: 'outside' }
				}
			}
		]
	}
};

/** Own text and `FontStyle` on each: a bold, larger rule label, and an italic band label on the lower edge, outside the band. `dx`/`dy` in a label's `styles` add to its default gap. */
export const Styled: Story = {
	args: {
		statistics: [
			{
				type: 'deviation',
				pooled: true,
				rule: {
					stroke: '#7c3aed',
					label: { text: 'Mean', styles: { fontWeight: 'bold', fontSize: 12 } }
				},
				band: {
					fill: '#7c3aed',
					label: {
						text: '−1 SD',
						edge: 'lower',
						position: 'outside',
						styles: { fontStyle: 'italic', fontSize: 11, fill: '#5b21b6' }
					}
				}
			}
		]
	}
};

/** One labelled rule and band per series, each label in its series' color. */
export const PerSeries: Story = {
	args: {
		statistics: [{ type: 'deviation', rule: { label: true }, band: { label: true } }]
	}
};
