import { LIFE } from '$datasets';

/** The line plot every automatic-legend story starts from: one series per sex. */
export const AUTOMATIC_ARGS = {
	width: 760,
	height: 360,
	data: LIFE,
	x: 'year',
	y: 'value',
	color: 'sex',
	scales: { x: { nice: false } }
};

/** What `legend` takes, as documented on every automatic-legend story's control. */
export const LEGEND_ARG_TYPES = {
	legend: {
		description:
			'Unset or `true`: the legend the plot reads off what it draws. `false`: none. A list of sections: exactly those. `{ items, sections }`: the automatic one with those added. `{ series, color, opacity, r, symbol }`: the automatic one with the section of each channel adjusted.',
		control: false
	}
} as const;
