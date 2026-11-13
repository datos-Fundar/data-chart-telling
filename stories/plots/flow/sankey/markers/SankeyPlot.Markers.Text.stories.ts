import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import { RowContext } from '$lib/phases/context/RowContext';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';
import type { SankeyRowContext } from '$lib/types/plots/flow/sankey/props';
import type { ProcessedRow } from '$lib/types/phases';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `text` marker of the author's draws over a sankey's own rows - its nodes
// and its links - and reads what the plot knows of each through `RowContext`:
// where a link starts and ends, and its share of the nodes it joins.

const meta = {
	title: 'Plots/Flow/SankeyPlot/Markers/Text',
	component: SankeyPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: PENGUIN_COUNTS_BY_SEX,
		columns: ['species', 'island', 'sex'],
		value: 'count'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		columns: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'SankeyPlot' } }
	}
} satisfies Meta<typeof SankeyPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What the plot knows of a row it draws. */
const contextOf = (row: ProcessedRow) => RowContext.of<SankeyRowContext>(row);

/** How far from a node's middle a label beside it starts: half the node's default width, and a gap. */
const BESIDE_A_NODE = 10;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * `styles.values.position: 'outside'` writes the species' and the sexes' labels past the plot's edges, so the
 * room beside those nodes is left to the links. Two `text` markers write there each link's share: of its species
 * where it leaves one - a third of the Adelies live on Torgersen - and of its sex where it reaches one.
 */
export const LinkShares: Story = {
	args: {
		styles: { values: { position: 'outside' } },
		markers: [
			{
				type: 'text',
				transforms: [
					{ type: 'filter', filter: (row) => contextOf(row).start?.column === 'species' }
				],
				x: (row) => contextOf(row).start!.column,
				y: (row) => contextOf(row).start!.y,
				dx: BESIDE_A_NODE,
				textAnchor: 'start',
				lineAnchor: 'middle',
				text: (row) => `${Math.round(contextOf(row).sourceShare!)}%`
			},
			{
				type: 'text',
				transforms: [{ type: 'filter', filter: (row) => contextOf(row).end?.column === 'sex' }],
				x: (row) => contextOf(row).end!.column,
				y: (row) => contextOf(row).end!.y,
				dx: -BESIDE_A_NODE,
				textAnchor: 'end',
				lineAnchor: 'middle',
				text: (row) => `${Math.round(contextOf(row).targetShare!)}%`
			}
		]
	}
};
