import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import AutoRotateDemo from './AutoRotateDemo.svelte';
import AutoRotateDemoSource from './AutoRotateDemo.svelte?raw';
import { demoSource } from '../../../common/docsSource';
import { PROVINCE_VALUES, AGES } from '$examples/data';

/**
 * `axis.autoRotate` (on by default) lets the category axis of any plot turn its
 * labels when they would not fit side by side: to 45 degrees, then to 90, and when
 * even that is not enough only every few labels are written. The margin grows to
 * fit the turned labels.
 *
 * ```ts
 * import { setConfiguration } from '@fundar/data-chart-telling';
 *
 * setConfiguration({ axis: { autoRotate: false } });
 * ```
 *
 * A plot opts out with a `tickRotate` of its own on the axis - `0` keeps the labels
 * flat, any other angle is used as it is. The first story switches the global
 * configuration and the plot's width live; the others set the width, or the prop,
 * on one plot and leave the configuration alone.
 */
const meta = {
	title: 'Configuration/Styling/Auto rotate',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		height: 320,
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex',
		scales: { y: { domain: [70, 85] } }
	},
	parameters: {
		layout: 'padded',
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The global configuration and the width, switched live: shrink the plot and the
 * labels turn to 45 degrees, then to 90; with `axis.autoRotate` off they stay flat
 * and overlap. The configuration is global, so this story renders in a frame of its
 * own.
 */
export const Default: StoryObj = {
	render: () => ({ Component: AutoRotateDemo }),
	parameters: {
		docs: {
			source: demoSource(AutoRotateDemoSource).docs.source,
			story: { inline: false, height: '620px' }
		}
	}
};

/** On a narrow plot, such as a phone's, the labels turn to 45 degrees. */
export const Narrow: Story = {
	args: { width: 320 }
};

/** Narrower, 45 degrees would still leave them touching, so they stand at 90. */
export const Narrower: Story = {
	args: { width: 200 }
};

/** `scales.x.tickRotate: 0` keeps the labels flat on one plot, whatever the room. */
export const KeepFlat: Story = {
	args: {
		width: 320,
		scales: { y: { domain: [70, 85] }, x: { tickRotate: 0 } } satisfies AxisBasedScalesConfig
	}
};

/** An angle of the plot's own is used as it is, and the margin grows to fit it. */
export const OwnAngle: Story = {
	args: {
		width: 720,
		scales: { y: { domain: [70, 85] }, x: { tickRotate: -30 } } satisfies AxisBasedScalesConfig
	}
};

/** A vertical category axis never turns its labels: with more rows than fit, it writes only every few. */
export const ManyRows: Story = {
	args: {
		width: 420,
		height: 260,
		data: AGES.filter((row) => row.sex === 'Female'),
		x: 'share',
		y: 'ageGroup',
		color: undefined,
		scales: undefined
	}
};
