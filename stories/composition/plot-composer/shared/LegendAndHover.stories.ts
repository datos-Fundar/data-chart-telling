import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ComposerShared from './ComposerShared.svelte';
import ComposerSharedSource from './ComposerShared.svelte?raw';
import { demoSource } from '../../../common/docsSource';

/**
 * One legend whose toggles reach every panel, and `hover.sync` highlighting the
 * same year in all of them.
 */
const meta = {
	title: 'Composition/PlotComposer/Shared/Legend and Hover',
	component: ComposerShared,
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta<typeof ComposerShared>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SharedLegendAndHover: Story = {
	parameters: demoSource(ComposerSharedSource)
};
