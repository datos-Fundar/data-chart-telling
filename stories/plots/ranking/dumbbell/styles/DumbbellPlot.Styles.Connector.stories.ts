import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/ranking/dumbbell/Plot.svelte';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_SHARES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.connector` styles the line each category draws between its dots: its `width`
// (a number, or `'dots'` for a band as thick as the dots), its `color` (one color, or
// by the sign of the `difference` between two series, or by the `length` of the
// connector), its `opacity`, and a `label` written on it. A difference runs from the
// first series to the last, or from `connector.from` to `connector.to`.

/** The first and the last census: each age group's share in 1991 and in 2022. */
const CENSUSES = AGE_SHARES.filter((row) => row.year === 1991 || row.year === 2022);

const meta = {
	title: 'Plots/Ranking/DumbbellPlot/Styles/Connector',
	component: DumbbellPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: CENSUSES,
		x: 'share',
		y: 'ageGroup',
		grouping: 'year',
		scales: { x: { domain: [14, 26] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `color` as a plain CSS color replaces the neutral gray default for every connector. */
export const OneColor: Story = {
	args: {
		styles: {
			connector: { color: '#7c3aed', width: 4 }
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `color` as a function gets each connector (`category`, `from`, `to`, `length`, `difference`): here the age groups whose share rose are highlighted and the rest stay gray. */
export const ColorFromFunction: Story = {
	args: {
		styles: {
			connector: {
				color: (range) => ((range.difference ?? 0) > 0 ? '#7c3aed' : '#cbd5e1'),
				width: 4
			}
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `color: { by: 'sign' }` paints each connector by whether its group's share rose or fell between the two censuses. */
export const ColoredBySign: Story = {
	args: {
		styles: {
			connector: { color: { by: 'sign', positive: '#16a34a', negative: '#dc2626' }, width: 4 }
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `color: { by: 'length' }` darkens the longer connectors: the age groups that changed the most. */
export const ColoredByLength: Story = {
	args: {
		styles: {
			connector: { color: { by: 'length', scheme: ['#cbd5e1', '#1e293b'] }, width: 5 }
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `label: true` writes the difference beside each connector - signed, from the first census to the last. */
export const LabelledDifference: Story = {
	args: {
		styles: {
			connector: {
				color: { by: 'sign', positive: '#16a34a', negative: '#dc2626' },
				label: { format: (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)} pts` }
			}
		} satisfies ConnectorBasedStylesConfig
	}
};

/** A band: `width: 'dots'` makes the connector as thick as the dots, and the label goes on it with `anchor: 'middle'`. */
export const BandWithLabel: Story = {
	args: {
		height: 480,
		styles: {
			connector: {
				width: 'dots',
				opacity: 0.35,
				color: { by: 'sign', positive: '#16a34a', negative: '#dc2626' },
				label: {
					anchor: 'middle',
					format: (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}`
				}
			}
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `arrow: true` draws each connector as an arrow from the first census to the last: it points the way the share moved, and the sign colors it. */
export const Arrows: Story = {
	args: {
		styles: {
			connector: {
				arrow: true,
				color: { by: 'sign', positive: '#16a34a', negative: '#dc2626' },
				label: { format: (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)} pts` }
			}
		} satisfies ConnectorBasedStylesConfig
	}
};

/** The arrow is as thick as `width` says - thinner than a band by default - and `arrow` takes the head's `headLength` and `headAngle`. */
export const BoldArrows: Story = {
	args: {
		styles: {
			connector: {
				arrow: { headLength: 12, headAngle: 45 },
				width: 3,
				color: '#334155'
			}
		} satisfies ConnectorBasedStylesConfig
	}
};
