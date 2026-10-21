import { getConfiguration } from '$lib/configuration/config.svelte';
import { buildLineMarkers } from '$lib/plots/evolution/line/markers';
import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import type { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { ValueAnchor } from '$lib/types/plots/constants';
import type { EdgeBox } from '$lib/types/layout/box';
import type { AxisBasedMarkersConfig, TextMarkerConfig } from '$lib/types/markers/common';
import type { SlopePlotState, SlopePlotCtx } from '$lib/types/plots/evolution/slope/state';

/** The anchor of the labels at the plot's start: the mirror of the end's, so `'start'` always reads outward. */
function startAnchor(anchor: ValueAnchor): ValueAnchor {
	return anchor === 'start' ? 'end' : anchor === 'end' ? 'start' : anchor;
}

/** The value a position is told apart by: a date by its time. */
const keyOf = (value: unknown) => (value instanceof Date ? value.getTime() : value);

/**
 * SlopePlot's "markers" phase: each series' line, with a dot on every point
 * (a slope has few), over the rows the "transforms" phase left.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: SlopePlotState<TData>,
	ctx: SlopePlotCtx
): AxisBasedMarkersConfig[] {
	const { slope } = getConfiguration();
	const groups = (state.processedGroups ?? []).map((group) => ({
		...group,
		visualSegments: group.visualSegments.map((segment) => ({
			...segment,
			styles: {
				...segment.styles,
				stroke: { strokeWidth: slope.strokeWidth, ...segment.styles.stroke },
				dots: { dotRadius: slope.dotRadius, ...segment.styles.dots }
			}
		}))
	}));
	return buildLineMarkers({
		groupedSeries: groups,
		colorFor: state.colorForSeries!,
		disabledStrokeFor: (name) => ctx.interaction?.strokeFor(name),
		disabledDotsFor: (name) => ctx.interaction?.dotsFor(name)
	});
}

/** The rows labelled at the plot's first position and at its last, each series' own. */
function labelledEnds<TData extends Record<string, unknown>>(state: SlopePlotState<TData>) {
	const processed = state.processedData!;
	const x = ProcessedPositions.of(processed).x;
	const domain = state.scales.x?.domain;
	const positions = Array.isArray(domain)
		? domain.map(keyOf)
		: [...new Set(processed.data.map((row) => keyOf(x(row))))];
	const first = positions[0];
	const last = positions[positions.length - 1];
	const rows = state.labelled ?? [];
	return {
		start: rows.filter((row) => keyOf(x(row)) === first),
		end: rows.filter((row) => keyOf(x(row)) === last && keyOf(x(row)) !== first)
	};
}

/**
 * SlopePlot's value labels: the series' first points labelled before them and
 * its last ones after, each end spread apart where its labels would overlap.
 */
export function buildValueLabels<TData extends Record<string, unknown>>(
	labels: ValueLabels,
	state: SlopePlotState<TData>
): TextMarkerConfig[] {
	if (!state.processedData) return [];
	const { start, end } = labelledEnds(state);
	return [
		...labels.atSeriesEnds(state, {
			rows: start,
			anchor: startAnchor(labels.anchor),
			lane: true,
			flip: false
		}),
		...labels.atSeriesEnds(state, { rows: end, lane: true })
	];
}

/** Where SlopePlot's labels are expected to sit: past the points at both ends. */
export function buildReach<TData extends Record<string, unknown>>(
	labels: ValueLabels,
	state: SlopePlotState<TData>
): EdgeBox[] {
	// Labels before the first position reach the left edge, those after the last one the right.
	const before = labels
		.reachAtSeriesEnds(state, startAnchor(labels.anchor))
		.map(({ box, edges }) => ({ box, edges: edges.filter((edge) => edge !== 'right') }));
	const after = labels
		.reachAtSeriesEnds(state)
		.map(({ box, edges }) => ({ box, edges: edges.filter((edge) => edge !== 'left') }));
	return [...before, ...after];
}
