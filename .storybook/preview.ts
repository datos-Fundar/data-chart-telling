import type { Preview } from '@storybook/svelte-vite';
import { setConfiguration } from '$lib/configuration/config.svelte';
import { THEMES } from '$lib/configuration/themes';
import { renderSource } from '../stories/common/docsSource';

const preview: Preview = {
	// Storybook's object control always expands `data` in full, with no option
	// to collapse it, so the control is hidden for every story instead.
	argTypes: {
		data: { control: false }
	},
	beforeEach: () => {
		// `DEFAULT_CONFIG` is an intentional no-op theme; apply the Default
		// preset so every story shows an opinionated look out of the box. Runs
		// before each story, so it re-asserts even after a story (e.g. the
		// Configuration demo) resets or switches the global config.
		setConfiguration(THEMES.Default);
	},
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},

		docs: {
			source: {
				type: 'dynamic',
				// Overridable per-story via `parameters.docs.source.code` — see `renderSource`.
				transform: (_src: string, ctx: any) => {
					const c = ctx.component as any;
					const name =
						ctx.parameters?.docs?.source?.name ||
						c?.displayName ||
						c?.__name ||
						c?.name ||
						ctx.title?.split('/').pop() ||
						'Component';
					return renderSource(name, ctx.args ?? {});
				}
			}
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: 'todo'
		},

		options: {
			// Sidebar order: a learning path from the low-level primitives (Plots,
			// then the layout building blocks — legend/timeline/facets/tooltip) up
			// through styling, the ready-made Charts, and finally Orchestration,
			// which shows them all composed together. Unlisted stories fall back
			// to alphabetical order.
			storySort: {
				order: [
					'Plots',
					[
						'LinePlot',
						[
							'Series',
							'Scales',
							'Styles',
							'Segments',
							'Markers',
							['Rules', 'Deltas', 'Custom'],
							'Tooltip'
						],
						'AreaPlot',
						['Series', 'Scales', 'Styles', 'Segments', 'Markers', 'Tooltip'],
						'BarPlot',
						['Series', 'Scales', 'Styles', 'Segments', 'Markers', ['Rules', 'Hover'], 'Tooltip'],
						'HeatmapPlot',
						['Series', 'Scales', 'Styles', 'Segments', 'Markers', ['Rules', 'Hover'], 'Tooltip'],
						'PyramidPlot',
						['Series', 'Scales', 'Styles', 'Segments', 'Markers', ['Rules'], 'Tooltip'],
						'ScatterPlot',
						[
							'Series',
							'Scales',
							'Styles',
							'Segments',
							'Bubble',
							'Markers',
							['Rules', 'Hover', 'Custom'],
							'Tooltip'
						],
						'GeoPlot',
						[
							'Series',
							'Scales',
							'Coordinates',
							['Projection', 'Zoom', 'Pan', 'Rotate', 'Camera', 'CameraTransition'],
							'Styles',
							'Segments',
							'Markers',
							['Graticule', 'Dot', 'Vector', 'Link', 'Contour', 'Inset', 'Hover', 'Custom'],
							'Tooltip'
						]
					],
					'Channels',
					[
						'Color',
						[
							'Plot Level',
							['Heatmap', 'Geo'],
							'Marker Level',
							['Dot', 'Cell', 'Bar'],
							'Independent Ramps'
						],
						'Opacity',
						'Symbol',
						'R',
						'Length',
						'X1X2Y1Y2'
					],
					'Markers',
					[
						'Area',
						'Arrow',
						'Bar',
						'Box',
						'Brush',
						'Cell',
						'Contour',
						'Custom',
						'Delaunay',
						'Delta',
						'Density',
						'Difference',
						'Dot',
						'Geo',
						'Graticule',
						'Hover',
						'Hull',
						'Image',
						'Inset',
						'Line',
						'Link',
						'Raster',
						'Rect',
						'Rule',
						'Sphere',
						'Text',
						'Tick',
						'Trail',
						'Vector',
						'Voronoi',
						'Waffle',
					],
					'Layout',
					[
						'Facets',
						['Grid', 'MarginAlignment', 'Paginated', 'Carousel'],
						'Legend',
						['Discrete', 'Continuous', 'Composition', 'Interactive', 'Paginated'],
						'Tooltip',
						['Basics', 'MultiSeries', 'Customization', 'FacetSync'],
						'Statistics'
					],
					'Configuration',
					'Charts',
					'Orchestration'
				]
			}
		}
	}
};

export default preview;
