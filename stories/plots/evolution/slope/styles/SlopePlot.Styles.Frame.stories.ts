import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_SHARES } from '$datasets';

const CENSUSES = AGE_SHARES.filter(({ year }) => year === 1991 || year === 2022);

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.frame` draws a border around the plot's own content, the same as
// every other plot kind.

const meta = {
	title: 'Plots/Evolution/SlopePlot/Styles/Frame',
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
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'SlopePlot' } }
	}
} satisfies Meta<typeof SlopePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `frame: true` draws a plain border around the content box. */
export const Default: Story = {
	args: { styles: { frame: true, values: { show: true } } satisfies AxisBasedStylesConfig }
};

/** `frame` as an object overrides the border's look field by field. */
export const Custom: Story = {
	args: {
		styles: {
			frame: { stroke: '#7c3aed', strokeWidth: 2 },
			values: { show: true }
		} satisfies AxisBasedStylesConfig
	}
};
