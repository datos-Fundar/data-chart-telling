import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { AUTOMATIC_ARGS, LEGEND_ARG_TYPES } from './common';

/**
 * Rewriting the labels of the automatic legend: `legend.series.labels` adds a
 * unit or shortens a word on every item, without removing the automatic items to
 * write them again. The text each starts from is its `label`, else its name as
 * the legend writes it - `female` reads "Female". `replace` goes first, then
 * `prefix` and `suffix` go around the result.
 */
const meta = {
	title: 'Layout/Legend/Automatic/Labels',
	component: LinePlot,
	tags: ['autodocs'],
	args: AUTOMATIC_ARGS,
	argTypes: LEGEND_ARG_TYPES,
	parameters: { docs: { source: { name: 'LinePlot' } } }
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `suffix` is written after every label - here a unit: "Female (life)", "Male (life)". */
export const Suffix: Story = {
	args: { legend: { series: { labels: { suffix: ' (life)' } } } }
};

/** `prefix` is written before every label: "Sex: Female", "Sex: Male". */
export const Prefix: Story = {
	args: { legend: { series: { labels: { prefix: 'Sex: ' } } } }
};

/**
 * `replace` as a record swaps a text for another, wherever it is found in a
 * label: "Female" becomes "F" and "Male" becomes "M" - a short form for a narrow screen.
 */
export const ReplaceText: Story = {
	args: { legend: { series: { labels: { replace: { Female: 'F', Male: 'M' } } } } }
};

/**
 * `replace` as a list of `[pattern, replacement]` pairs takes a regular expression
 * as the pattern, and runs the pairs in order. Here each pattern matches a whole label:
 * "Female" becomes "Fem." and "Male" becomes "Masc.".
 */
export const ReplacePattern: Story = {
	args: {
		legend: {
			series: {
				labels: {
					replace: [
						[/^Female$/, 'Fem.'],
						[/^Male$/, 'Masc.']
					]
				}
			}
		}
	}
};

/** The swaps go first and the prefix and suffix around the result: "F (sex)", "M (sex)". */
export const Combined: Story = {
	args: {
		legend: {
			series: { labels: { replace: { Female: 'F', Male: 'M' }, suffix: ' (sex)' } }
		}
	}
};

/**
 * Only the label changes: the names stay, so `legend.off` and the legend's own toggles
 * still go by them. Here `female` is turned off from code and its item fades with its
 * new label.
 */
export const KeepsNames: Story = {
	args: {
		legend: {
			off: { female: 0.25 },
			series: { labels: { replace: { Female: 'F', Male: 'M' } } }
		}
	}
};
