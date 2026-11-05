import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClickDemo from './ClickDemo.svelte';
import ClickDemoSource from './ClickDemo.svelte?raw';
import DoubleClickDemo from './DoubleClickDemo.svelte';
import DoubleClickDemoSource from './DoubleClickDemo.svelte?raw';
import ContextMenuDemo from './ContextMenuDemo.svelte';
import ContextMenuDemoSource from './ContextMenuDemo.svelte?raw';
import PointerEnterLeaveDemo from './PointerEnterLeaveDemo.svelte';
import PointerEnterLeaveDemoSource from './PointerEnterLeaveDemo.svelte?raw';
import MouseEnterLeaveDemo from './MouseEnterLeaveDemo.svelte';
import MouseEnterLeaveDemoSource from './MouseEnterLeaveDemo.svelte?raw';
import PointerMoveDemo from './PointerMoveDemo.svelte';
import PointerMoveDemoSource from './PointerMoveDemo.svelte?raw';
import PointerDownUpDemo from './PointerDownUpDemo.svelte';
import PointerDownUpDemoSource from './PointerDownUpDemo.svelte?raw';
import { demoSource } from '../../common/docsSource';

/**
 * Every marker takes handlers for the pointer - `onclick`, `ondblclick`, `oncontextmenu`,
 * `onpointerdown`, `onpointerup`, `onpointerenter`, `onpointerleave`, `onpointermove`,
 * `onmouseenter` and `onmouseleave` - called with the event, the row of the shape it fired on and
 * that row's index.
 *
 * svelteplot documents these props on all its marks, but its code wires them up on `rect`, `bar`,
 * `cell`, `area`, `arrow`, `dot`, `trail`, `vector`, `line`, `link`, `delaunayLink` and `voronoi`
 * only, so the stories use those.
 */
const meta = {
	title: 'Layout/Events',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

/** `onclick` on a `dot` marker: clicking a dot gives the row it draws. */
export const Click: StoryObj = {
	render: () => ({ Component: ClickDemo as never }),
	parameters: demoSource(ClickDemoSource)
};

/** `ondblclick` on a `rect` marker: double-clicking an era locks it, and again unlocks it. */
export const DoubleClick: StoryObj = {
	render: () => ({ Component: DoubleClickDemo as never }),
	parameters: demoSource(DoubleClickDemoSource)
};

/**
 * `oncontextmenu` on a `rect` marker: `event.preventDefault()` keeps the browser's own menu from
 * opening, and the era gets one of ours.
 */
export const ContextMenu: StoryObj = {
	render: () => ({ Component: ContextMenuDemo as never }),
	parameters: demoSource(ContextMenuDemoSource)
};

/** `onpointerenter` and `onpointerleave` on a `dot` marker: which dot the pointer is over. */
export const PointerEnterAndLeave: StoryObj = {
	render: () => ({ Component: PointerEnterLeaveDemo as never }),
	parameters: demoSource(PointerEnterLeaveDemoSource)
};

/** `onmouseenter` and `onmouseleave` on an `area` marker: the band between the two lines. */
export const MouseEnterAndLeave: StoryObj = {
	render: () => ({ Component: MouseEnterLeaveDemo as never }),
	parameters: demoSource(MouseEnterLeaveDemoSource)
};

/**
 * `onpointermove` on a `rect` marker that covers the plot. svelteplot adds the position of the
 * pointer in the data to the event, as `dataX` and `dataY`.
 */
export const PointerMove: StoryObj = {
	render: () => ({ Component: PointerMoveDemo as never }),
	parameters: demoSource(PointerMoveDemoSource)
};

/** `onpointerdown` and `onpointerup` on a `rect` marker: a rectangle that darkens while it is pressed. */
export const PointerDownAndUp: StoryObj = {
	render: () => ({ Component: PointerDownUpDemo as never }),
	parameters: demoSource(PointerDownUpDemoSource)
};
