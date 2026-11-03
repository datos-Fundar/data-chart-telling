import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { FEMALE_LIFE, MALE_LIFE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.stroke` and `styles.dot` are the style every series is drawn with: its width, opacity and
// dashes, and a dot on each of its points. Each takes a style as it is, or a function of the series'
// name to set one series apart. `segments` are for what only part of a series looks like; what a
// segment sets wins over these, field by field, and a series a legend turned off dims over both.

const meta = {
	title: 'Plots/Evolution/LinePlot/Styles/Line',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { x: { nice: false } },
		series: [
			{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE },
			{ name: 'male', x: 'year', y: 'value', data: MALE_LIFE }
		]
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 700, step: 50 }
		},
		series: {
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		},
		styles: {
			description:
				'`styles.stroke` and `styles.dot`: a style, or a function of the series name returning one.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Every series alike ───────────────────────────────────────────────────────

/** One style for every series: a thicker line with a dot on each point. Each series keeps its own color. */
export const EverySeriesAlike: Story = {
	args: {
		styles: { stroke: { strokeWidth: 5 }, dot: { dotRadius: 4 } }
	}
};

// ── One series apart ─────────────────────────────────────────────────────────

/** A function of the series' name sets one series apart: here `male` is thinner, dashed and faint, and only `female` has dots. */
export const OneSeriesApart: Story = {
	args: {
		styles: {
			stroke: (name: string) =>
				name === 'male'
					? { strokeWidth: 2, strokeOpacity: 0.5, strokeDasharray: '4 4' }
					: { strokeWidth: 4 },
			dot: (name: string) => (name === 'female' ? { dotRadius: 4 } : undefined)
		}
	}
};

// ── With a segment ───────────────────────────────────────────────────────────

/** A segment restyles a stretch over the series' style: from 2005 on, `female` is dashed, and keeps the width and dots `styles` gave it. */
export const SegmentOverStyles: Story = {
	args: {
		styles: { stroke: { strokeWidth: 4 }, dot: { dotRadius: 3 } },
		segments: {
			female: [{ areas: [{ x: { from: 2005 } }], styles: { stroke: { strokeDasharray: '6 4' } } }]
		}
	}
};

// ── With the legend ──────────────────────────────────────────────────────────

/**
 * A series the legend turns off from code dims over `styles`: its line and its dots take the opacity
 * given in `legend.off`, and its legend entry fades with it. Nothing else has to be set for it.
 */
export const LegendOff: Story = {
	args: {
		styles: { stroke: { strokeWidth: 4 }, dot: { dotRadius: 4 } },
		legend: { off: { male: 0.25 } }
	}
};
