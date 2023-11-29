import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import {
   FLUID_PARAMS,
   FluidParams,
} from "../../packages/use-shader-fx/src/hooks/useFluid";
import { UseFluid, UseFluidWithTexture } from "./UseFluid";

const meta = {
   title: "useFluid",
   component: UseFluid,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseFluid>;

export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: FLUID_PARAMS,
   argTypes: setArgTypes<FluidParams>(FLUID_PARAMS),
};
export const Fluid: Story = {
   render: (args) => <UseFluid {...args} />,
   ...storySetting,
};
export const WithTexture: Story = {
   render: (args) => <UseFluidWithTexture {...args} />,
   ...storySetting,
};
