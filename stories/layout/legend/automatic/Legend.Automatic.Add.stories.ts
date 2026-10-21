import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import AddItemsDemo from './AddItemsDemo.svelte';
import AddItemsDemoSource from './AddItemsDemo.svelte?raw';
import AddSectionsDemo from './AddSectionsDemo.svelte';
import AddSectionsDemoSource from './AddSectionsDemo.svelte?raw';
import NamedMarksDemo from './NamedMarksDemo.svelte';
import NamedMarksDemoSource from './NamedMarksDemo.svelte?raw';
import { demoSource } from '../../../common/docsSource';

/**
 * Adding to the automatic legend: what the plots read stays, and `legend`
 * - or a segment or marker with its own `legend` - puts more beside it.
 */
const meta = {
	title: 'Layout/Legend/Automatic/Add',
	component: LinePlot,
	tags: ['autodocs'],
	parameters: { docs: { source: { name: 'LinePlot' } } }
} satisfies Meta<typeof LinePlot>;

export default meta;

/**
 * `legend: { items }` keeps the automatic legend and adds items to its series
 * section - here, one explaining the highlighted part of the female curve.
 */
export const AddItems: StoryObj = {
	render: () => ({ Component: AddItemsDemo }),
	parameters: demoSource(AddItemsDemoSource)
};

/**
 * `legend: { sections }` keeps the automatic legend and adds whole sections
 * after it. With other sections beside it, the series section is titled
 * "Series" - set `legend.seriesTitle` in the configuration to change the text
 * (`text`) or leave it untitled (`enabled: false`).
 */
export const AddSections: StoryObj = {
	render: () => ({ Component: AddSectionsDemo }),
	parameters: demoSource(AddSectionsDemoSource)
};

/**
 * A segment or marker names itself on the automatic legend with its own
 * `legend`. A label alone (the segment here) takes the color and mark it
 * draws with; an item (the threshold rule) sets its own label, color,
 * symbol or line style - here, a dashed line.
 */
export const NamedSegmentsAndMarkers: StoryObj = {
	render: () => ({ Component: NamedMarksDemo }),
	parameters: demoSource(NamedMarksDemoSource)
};
