import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import { type AgeShareRow, AGE_SHARES } from '$datasets';

const CENSUSES = AGE_SHARES.filter(({ year }) => year === 1991 || year === 2022);

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering a position reads every series' value there, through the same
// `tooltip` prop every other plot kind takes.

const meta = {
	title: 'Plots/Evolution/SlopePlot/Tooltip',
	component: SlopePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: CENSUSES,
		x: 'year',
		y: 'share',
		color: 'ageGroup',
		styles: { values: { show: true } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		tooltip: { description: 'Tooltip runtime configuration.', control: false }
	},
	parameters: {
		docs: { source: { name: 'SlopePlot' } }
	}
} satisfies Meta<typeof SlopePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The default text: the hovered position's value of every series. */
export const DefaultTooltip: Story = {
	args: { tooltip: { sync: false } }
};

/** The `format` callback gets the hovered row and returns its label. */
export const CustomFormat: Story = {
	args: {
		tooltip: {
			sync: false,
			format: (row) => {
				const { ageGroup, year, share } = row as AgeShareRow;
				return `${ageGroup} in ${year}: ${share}%`;
			}
		}
	}
};
