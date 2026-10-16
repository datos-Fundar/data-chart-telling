import type { Meta, StoryObj } from '@storybook/svelte-vite';
import CameraTransitionDemo, { coordinatesForScene } from './CameraTransitionDemo.svelte';
import CameraScrollDemo, { coordinatesForScroll } from './CameraScrollDemo.svelte';
import CameraScrubberDemo, { coordinatesForProgress } from './CameraScrubberDemo.svelte';
import { renderSource } from '../../../common/docsSource';
import { WORLD_COUNTRIES } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `coordinates.camera.transition` animates either auto-played over `duration`
// (`ClickToFly`) or scrubbed from a live `progress` value (`ScrollToFly`,
// `ScrubToFly`). Each demo renders through a wrapper component, so
// `parameters.docs.source.code` overrides the "show code" panel with the
// real `<GeoPlot>` call via `renderSource` - see `stories/common/docsSource.ts`.

const meta = {
	title: 'Plots/GeoPlot/Coordinates/CameraTransition',
	tags: ['autodocs'],
	args: { width: 940, height: 500 },
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } }
	}
} satisfies Meta<typeof CameraTransitionDemo>;

export default meta;

/** Click the button to swap `camera.target` between two feature sets - `GeoPlot` auto-plays the move. */
export const ClickToFly: StoryObj<typeof CameraTransitionDemo> = {
	render: (args) => ({ Component: CameraTransitionDemo, props: args }),
	args: { duration: 1000 },
	argTypes: {
		duration: { control: { type: 'range', min: 100, max: 3000, step: 100 } }
	},
	parameters: {
		docs: {
			source: {
				code: renderSource('GeoPlot', {
					width: 940,
					height: 500,
					data: WORLD_COUNTRIES,
					coordinates: coordinatesForScene(0, 1000)
				})
			}
		}
	}
};

/** Scroll the panel - `camera.transition.progress` is driven from scroll position, so the move stalls/reverses with it. */
export const ScrollToFly: StoryObj<typeof CameraScrollDemo> = {
	render: (args) => ({ Component: CameraScrollDemo, props: args }),
	parameters: {
		docs: {
			source: {
				code: renderSource('GeoPlot', {
					width: 940,
					height: 500,
					data: WORLD_COUNTRIES,
					coordinates: coordinatesForScroll(0)
				})
			}
		}
	}
};

/** Drag the slider - `camera.transition.progress` comes straight from a range input, standing in for whatever real input (scroll, a timeline, ...) a host would wire it to. */
export const ScrubToFly: StoryObj<typeof CameraScrubberDemo> = {
	render: (args) => ({ Component: CameraScrubberDemo, props: args }),
	parameters: {
		docs: {
			source: {
				code: renderSource('GeoPlot', {
					width: 940,
					height: 500,
					data: WORLD_COUNTRIES,
					coordinates: coordinatesForProgress(0)
				})
			}
		}
	}
};
