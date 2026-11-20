import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';

/** The provinces of Argentina, with the long names a category axis has to make room for. */
const PROVINCES = [
	'Buenos Aires',
	'Catamarca',
	'Chaco',
	'Chubut',
	'Ciudad Autónoma de Buenos Aires',
	'Córdoba',
	'Corrientes',
	'Entre Ríos',
	'Formosa',
	'Jujuy',
	'La Pampa',
	'La Rioja',
	'Mendoza',
	'Misiones',
	'Neuquén',
	'Río Negro',
	'Salta',
	'San Juan',
	'San Luis',
	'Santa Cruz',
	'Santa Fe',
	'Santiago del Estero',
	'Tierra del Fuego, Antártida e Islas del Atlántico Sur',
	'Tucumán'
].map((province, i) => ({ province, value: 20 + ((i * 37) % 60) }));

/**
 * `maxWidth` on a scale cuts the labels of a category axis (or of one with a `tickFormat`) to that many px with an
 * ellipsis. On a `y` axis the margin is then kept for the widest of them, over all the categories and not the ones
 * the axis happens to draw, so the plot does not change width as other labels show - as the timeline of a plot with a
 * crowded axis steps, say.
 */
const meta = {
	title: 'Layout/Scales/Tick max width',
	component: BarPlot,
	parameters: { docs: { source: { name: 'BarPlot' } } },
	tags: ['autodocs'],
	args: {
		width: 640,
		height: 640,
		data: PROVINCES,
		x: 'value',
		y: 'province',
		scales: { x: { nice: false } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
		height: { control: { type: 'range', min: 240, max: 800, step: 20 } },
		data: { control: false },
		scales: { control: false }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Without it, the margin follows the longest label the axis draws: all of it. */
export const Unlimited: Story = {};

/** `scales.y.maxWidth: 120` - the long names are cut, and the margin is that wide and no wider. */
export const MaxWidth: Story = {
	args: { scales: { x: { nice: false }, y: { maxWidth: 120 } } }
};

/**
 * The same on a short plot, where the axis writes only some of the categories: the margin is the same as above, and
 * does not follow the labels that are drawn.
 */
export const CrowdedAxis: Story = {
	args: { height: 280, scales: { x: { nice: false }, y: { maxWidth: 120 } } }
};
