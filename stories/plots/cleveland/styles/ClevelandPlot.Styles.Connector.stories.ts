import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/cleveland/Plot.svelte';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_SHARES } from '$examples/data';
import { SEQUENTIAL_COLORS } from '../colors';

// ── Meta ──────────────────────────────────────────────────────────────────────
// With more than two series, the connector spans the lowest and the highest dot of each
// category, and a difference runs between two series of your choice: `connector.from`
// and `connector.to` (by default the first and the last).

const meta = {
	title: 'Plots/ClevelandPlot/Styles/Connector',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: AGE_SHARES,
		x: 'share',
		y: 'ageGroup',
		grouping: 'year',
		scales: { color: SEQUENTIAL_COLORS, x: { domain: [14, 26] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ClevelandPlot' } }
	}
} satisfies Meta<typeof ClevelandPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** By default a difference runs from the first census (1991) to the last (2022): the connector is drawn full between those two dots, and faded where it runs on to the dots of the censuses in between. The label sits in the middle of that stretch. */
export const DifferenceLabelled: Story = {
	args: {
		styles: {
			connector: {
				width: 4,
				label: { format: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}` }
			}
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `from` and `to` name the series a difference is taken between: here from 2001 to 2010, the two middle censuses. Only the stretch between those two dots takes the sign's color and the label; the rest of the connector stays neutral. */
export const BetweenTwoCensuses: Story = {
	args: {
		styles: {
			connector: {
				from: '2001',
				to: '2010',
				width: 4,
				color: { by: 'sign', positive: '#16a34a', negative: '#dc2626' },
				label: { format: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}` }
			}
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `width` also takes a function of the connector: here its thickness follows its length, so the age groups whose share moved the most draw the thickest. */
export const WidthFromLength: Story = {
	args: {
		styles: {
			connector: {
				width: (range) => Math.max(3, range.length * 4),
				color: '#94a3b8',
				label: { text: 'length', format: (value: number) => `${value.toFixed(1)} pts` }
			}
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `outside` restyles what lies past the `from` and `to` dots: here a pale blue instead of the faded neutral default. */
export const OutsideStyled: Story = {
	args: {
		styles: {
			connector: {
				from: '2001',
				to: '2010',
				width: 6,
				color: { by: 'sign', positive: '#16a34a', negative: '#dc2626' },
				outside: { color: '#bfdbfe', opacity: 0.8 },
				label: { format: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}` }
			}
		} satisfies ConnectorBasedStylesConfig
	}
};

/** With four censuses, the arrow goes between the two `from` and `to` name - here from 2001 to 2022 - and the line runs on to the other dots. */
export const ArrowBetweenTwoCensuses: Story = {
	args: {
		styles: {
			connector: {
				arrow: true,
				from: '2001',
				to: '2022',
				color: { by: 'sign', positive: '#16a34a', negative: '#dc2626' }
			}
		} satisfies ConnectorBasedStylesConfig
	}
};
