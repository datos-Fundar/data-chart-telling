import { describe, expect, test } from 'vitest';
import { buildGraphDefaults } from '$lib/plots/families/graph/defaults';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { HoverConfig } from '$lib/types/plots/props';
import type { AxisPlotEnv, AxisPlotState } from '$lib/types/phases';

type State = AxisPlotState<Record<string, unknown>, object>;

const env: AxisPlotEnv = { cfg: DEFAULT_CONFIG };
const state = {} as State;

const kind = (own?: { x?: object; y?: object }) =>
	buildGraphDefaults<State, AxisPlotEnv>({
		scales: own ? { defaults: () => own } : undefined,
		markers: { marks: () => [] },
		hover: { shape: () => ({ type: 'rect', x1: 'a', x2: 'b' }) }
	});

describe('buildGraphDefaults', () => {
	test('hides both axes and their grids', () => {
		const axes = kind().scales!.defaults!(state, env);
		expect(axes.x).toMatchObject({ axisDisplay: 'none', grid: false });
		expect(axes.y).toMatchObject({ axisDisplay: 'none', grid: false });
	});

	test("keeps the kind's own axis options, over the hidden ones", () => {
		const axes = kind({ x: { axisDisplay: 'top' }, y: { reverse: true } }).scales!.defaults!(
			state,
			env
		);
		expect(axes.x).toMatchObject({ axisDisplay: 'top', grid: false });
		expect(axes.y).toMatchObject({ axisDisplay: 'none', reverse: true });
	});

	test('hovers one shape at a time, restyling it without a crosshair', () => {
		const hover = kind().hover!;
		expect(hover.strategy).toBe('punctual');
		expect(hover.pointMatching).toBe('contains');
		const look = hover.marker!(state, env);
		expect(typeof look === 'function' ? look('punctual') : look).toMatchObject({
			back: [],
			front: []
		});
	});

	test("finds each hovered row through an invisible copy of the row's shape", () => {
		const row = { id: 1 };
		const config = { active: true, points: [{ row }] } as unknown as HoverConfig<
			Record<string, unknown>
		>;
		expect(kind().hover!.hitAreas!(state, config, env)).toEqual([
			{
				type: 'rect',
				x1: 'a',
				x2: 'b',
				data: [row],
				styles: { fill: 'transparent' },
				hover: 'trigger'
			}
		]);
	});
});
