import type {
	StackXTransform,
	StackYTransform,
	StackMosaicXTransform,
	StackMosaicYTransform
} from '$lib/types/transforms/stack';
import type { BinXTransform, BinYTransform, Bin2DTransform } from '$lib/types/transforms/bin';
import type { DensityXTransform, DensityYTransform } from '$lib/types/transforms/density';
import type { WindowXTransform, WindowYTransform } from '$lib/types/transforms/window';
import type { BollingerXTransform, BollingerYTransform } from '$lib/types/transforms/bollinger';
import type {
	NormalizeXTransform,
	NormalizeYTransform,
	NormalizeParallelXTransform,
	NormalizeParallelYTransform
} from '$lib/types/transforms/normalize';
import type { MapXTransform, MapYTransform } from '$lib/types/transforms/map';
import type { IntervalXTransform, IntervalYTransform } from '$lib/types/transforms/interval';
import type { JitterXTransform, JitterYTransform } from '$lib/types/transforms/jitter';
import type { ShiftXTransform, ShiftYTransform } from '$lib/types/transforms/shift';
import type { SortTransform, ShuffleTransform, ReverseTransform } from '$lib/types/transforms/sort';
import type { FilterTransform } from '$lib/types/transforms/filter';
import type { SelectTransform, SelectShorthandTransform } from '$lib/types/transforms/select';
import type {
	GroupXTransform,
	GroupYTransform,
	GroupZTransform,
	Group2DTransform
} from '$lib/types/transforms/group';

export type {
	TransformChannel,
	TransformReducer,
	PositionChannels
} from '$lib/types/transforms/common';
export type {
	StackXTransform,
	StackYTransform,
	StackMosaicXTransform,
	StackMosaicYTransform
} from '$lib/types/transforms/stack';
export type { BinXTransform, BinYTransform, Bin2DTransform } from '$lib/types/transforms/bin';
export type {
	DensityKernel,
	DensityXTransform,
	DensityYTransform
} from '$lib/types/transforms/density';
export type {
	WindowReducer,
	WindowXTransform,
	WindowYTransform
} from '$lib/types/transforms/window';
export type { BollingerXTransform, BollingerYTransform } from '$lib/types/transforms/bollinger';
export type {
	NormalizeBasis,
	NormalizeXTransform,
	NormalizeYTransform,
	NormalizeParallelXTransform,
	NormalizeParallelYTransform
} from '$lib/types/transforms/normalize';
export type { MapMethod, MapXTransform, MapYTransform } from '$lib/types/transforms/map';
export type { IntervalXTransform, IntervalYTransform } from '$lib/types/transforms/interval';
export type { JitterXTransform, JitterYTransform } from '$lib/types/transforms/jitter';
export type { ShiftAmount, ShiftXTransform, ShiftYTransform } from '$lib/types/transforms/shift';
export type {
	SortBy,
	SortTransform,
	ShuffleTransform,
	ReverseTransform
} from '$lib/types/transforms/sort';
export type { FilterTransform } from '$lib/types/transforms/filter';
export type {
	SelectBy,
	SelectTransform,
	SelectShorthandTransform
} from '$lib/types/transforms/select';
export type {
	GroupXTransform,
	GroupYTransform,
	GroupZTransform,
	Group2DTransform
} from '$lib/types/transforms/group';

/**
 * Every svelteplot transform a marker (via `CommonMarkerConfig.transforms`) or
 * a plot (via its `transforms` prop) can run on its rows before they're drawn.
 * Each one is a flat object: `type` picks the transform, and the rest are its
 * own channels and options, by svelteplot's own names.
 */
export type MarkerTransform =
	| StackYTransform
	| StackXTransform
	| StackMosaicXTransform
	| StackMosaicYTransform
	| BinXTransform
	| BinYTransform
	| Bin2DTransform
	| DensityXTransform
	| DensityYTransform
	| WindowXTransform
	| WindowYTransform
	| BollingerXTransform
	| BollingerYTransform
	| NormalizeXTransform
	| NormalizeYTransform
	| NormalizeParallelXTransform
	| NormalizeParallelYTransform
	| MapXTransform
	| MapYTransform
	| IntervalXTransform
	| IntervalYTransform
	| JitterXTransform
	| JitterYTransform
	| ShiftXTransform
	| ShiftYTransform
	| SortTransform
	| ShuffleTransform
	| ReverseTransform
	| FilterTransform
	| SelectTransform
	| SelectShorthandTransform
	| GroupXTransform
	| GroupYTransform
	| GroupZTransform
	| Group2DTransform;
