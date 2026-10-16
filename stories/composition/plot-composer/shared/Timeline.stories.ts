import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ComposerTimeline from './ComposerTimeline.svelte';
import ComposerTimelineSource from './ComposerTimeline.svelte?raw';
import { demoSource } from '../../../common/docsSource';

/** The composer's `timeline` scrubs every panel whose plot names its own time field. */
const meta = {
	title: 'Composition/PlotComposer/Shared/Timeline',
	component: ComposerTimeline,
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta<typeof ComposerTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SharedTimeline: Story = {
	parameters: demoSource(ComposerTimelineSource)
};
