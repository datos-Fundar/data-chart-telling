import type { AxisPlotDefaults } from '$lib/types/phases';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { GenericPlotState, GenericPlotEnv } from '$lib/types/plots/generic/state';

/** The plot with no kind: it draws only its `markers`. */
export function buildGenericDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	GenericPlotState<TData>,
	GenericPlotEnv
> {
	return {
		data: { segments: { color: (style: AreaStyle | undefined) => style?.fill } },
		markers: { marks: () => [] }
	};
}
