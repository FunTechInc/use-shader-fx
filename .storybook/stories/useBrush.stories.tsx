import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseBrush, UseBrushWithTexture } from "./UseBrush";
import {
   BRUSH_PARAMS,
   BrushParams,
} from "../../packages/use-shader-fx/src/hooks/useBrush";

const meta = {
   title: "useBrush",
   component: UseBrush,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseBrush>;
export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: BRUSH_PARAMS,
   argTypes: setArgTypes<BrushParams>(BRUSH_PARAMS),
};

export const Default: Story = {
   render: (args) => <UseBrush {...args} />,
   ...storySetting,
};

export const WithTexture: Story = {
   render: (args) => <UseBrushWithTexture {...args} />,
   ...storySetting,
};
