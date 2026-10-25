import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import CustomContentDemo from './CustomContentDemo.svelte';
import { ARGENTINA_CHILE_TRENDS, type CountryTrendRow } from '$datasets';

/** Custom tooltip text, anchor placement, and fully custom markup. */
const meta = {
	title: 'Layout/Tooltip/Customization',
	component: LinePlot,
	tags: ['autodocs'],
	args: { width: 680, height: 400, data: ARGENTINA_CHILE_TRENDS, x: 'year', y: 'value' },
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
		height: { control: { type: 'range', min: 240, max: 700, step: 20 } },
		data: { control: false },
		x: { control: false },
		y: { control: false },
		color: { control: false },
		tooltip: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Custom tooltip text via `format`. */
export const CustomFormat: Story = {
	args: {
		title: 'Custom format',
		data: ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina'),
		color: 'metric' as keyof CountryTrendRow,
		tooltip: {
			strategy: 'x',
			format: (row) => {
				const r = row as unknown as CountryTrendRow;
				return `${r.metric} · ${r.year}\nIndex ${r.value}`;
			}
		},
		markers: [{ type: 'hover' }]
	}
};

/**
 * `tooltip.anchorX`/`anchorY` set which side of the cursor the floating box
 * prefers; falls back toward the opposite side if the preferred one would
 * overflow the chart's own bounds.
 */
export const CustomAnchor: Story = {
	args: {
		title: 'Custom anchor',
		subtitle: 'The tooltip anchors above and to the left of the cursor',
		data: ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina'),
		color: 'metric' as keyof CountryTrendRow,
		tooltip: { strategy: 'x', anchorX: 'left', anchorY: 'top' },
		markers: [{ type: 'hover' }]
	}
};

/** Fully custom tooltip markup via `content`, replacing the default floating label. */
export const CustomContent: StoryObj = {
	render: () => ({ Component: CustomContentDemo })
};
