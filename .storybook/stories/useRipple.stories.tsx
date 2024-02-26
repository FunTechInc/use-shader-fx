import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseRipple, UseRippleWithTexture } from "./UseRipple";
import {
   RIPPLE_PARAMS,
   RippleParams,
} from "../../packages/use-shader-fx/src/fxs/interactions/useRipple";

const meta = {
   title: "interactions/useRipple",
   component: UseRipple,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseRipple>;
export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: RIPPLE_PARAMS,
   argTypes: setArgTypes<RippleParams>(RIPPLE_PARAMS),
};

export const Default: Story = {
   render: (args) => <UseRipple {...args} />,
   ...storySetting,
};

export const WithTexture: Story = {
   render: (args) => <UseRippleWithTexture {...args} />,
   ...storySetting,
};
