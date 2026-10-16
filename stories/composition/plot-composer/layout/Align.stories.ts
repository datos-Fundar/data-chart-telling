import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ComposerAlign from './ComposerAlign.svelte';
import ComposerAlignSource from './ComposerAlign.svelte?raw';
import { demoSource } from '../../../common/docsSource';

/**
 * `layout.align` lines up every panel's plot area with its row and column,
 * the way facets always do: each plot first sizes its own margins, then the
 * composer pins the widest ones per column and row on every panel in it. It
 * suits panels whose plots draw no title or legend of their own.
 */
const meta = {
	title: 'Composition/PlotComposer/Layout/Align',
	component: ComposerAlign,
	tags: ['autodocs'],
	parameters: { layout: 'padded' },
	argTypes: { align: { control: 'boolean' } }
} satisfies Meta<typeof ComposerAlign>;

export default meta;
type Story = StoryObj<typeof meta>;

// Set on each story: on the meta, Storybook's per-story `docs.source` drops it.
const parameters = demoSource(ComposerAlignSource);

/** Without it, each panel's value axis takes the room its own labels need. */
export const Unaligned: Story = { args: { align: false }, parameters };

/** With it, both plot areas start at the same x, so the years line up. */
export const Aligned: Story = { args: { align: true }, parameters };
